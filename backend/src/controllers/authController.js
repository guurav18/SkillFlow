const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailService');

// @desc    Register a new client or freelancer with email verification
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, skills, title, bio, hourlyRate, location, company } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // Restrict registration to client or freelancer (admin cannot be registered via public endpoint)
    const allowedRoles = ['client', 'freelancer'];
    const assignedRole = allowedRoles.includes(role) ? role : 'freelancer';

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. If you have not verified your email yet, please use the resend verification option.',
        alreadyRegistered: true,
        emailVerified: userExists.emailVerified,
      });
    }

    // Process skills if freelancer
    let formattedSkills = [];
    if (assignedRole === 'freelancer' && skills) {
      if (Array.isArray(skills)) {
        formattedSkills = skills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        formattedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Create user instance with emailVerified = false
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      skills: formattedSkills,
      title: title || '',
      bio: bio || '',
      hourlyRate: Number(hourlyRate) || 0,
      location: location || '',
      company: company || '',
      emailVerified: false,
    });

    // Generate secure 32-byte token and hash it before saving
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    let emailSent = true;
    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationToken,
      });
    } catch (mailErr) {
      emailSent = false;
      console.warn('[Register Email Warning]:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      emailSent,
      message: emailSent
        ? 'Registration successful! We sent a verification link to your email address.'
        : 'Registration successful! We had trouble delivering the verification email. Please click resend verification.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email using secure token
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    // Hash the raw token received from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by hashed token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This verification link is invalid or has expired. Please request a new one.',
      });
    }

    // If token has expired past 24 hours
    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'This verification link has expired after 24 hours. Please request a new one.',
      });
    }

    // If already verified (e.g. React StrictMode duplicate call or page refresh)
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: 'Your email has been verified successfully! You can now log in to your account.',
        email: user.email,
      });
    }

    // Mark as verified
    user.emailVerified = true;
    await user.save();

    // Send personalized role-tailored welcome email upon successful verification
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      role: user.role,
    }).catch((mailErr) => {
      console.warn('[Welcome Email Notice]:', mailErr.message);
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email verification token
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail })
      .select('+emailVerificationToken +emailVerificationExpires');

    // If no user found, respond with generic message to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists and has not been verified, a verification link has been sent.',
      });
    }

    // If already verified, reject resend request
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        alreadyVerified: true,
        message: 'This email address is already verified. Please sign in directly.',
      });
    }

    // 60-second cooldown rate limit against token generation spam
    // 24h expiration minus 60 seconds
    const cooldownPeriodMs = 60 * 1000;
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires.getTime() > Date.now() + (24 * 60 * 60 * 1000 - cooldownPeriodMs)
    ) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 60 seconds before requesting another verification email.',
      });
    }

    // Generate new token and overwrite old one
    const verificationToken = user.generateVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationToken,
      });
    } catch (mailErr) {
      console.warn('[Resend Email Warning]:', mailErr.message);
      return res.status(500).json({
        success: false,
        message: 'Unable to deliver verification email. Please check your email configuration or try again shortly.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A new verification link has been sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (requires verified email)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user with password and verification status
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      '+password +emailVerificationToken +emailVerificationExpires'
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Block login if email is not verified
    if (user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        emailUnverified: true,
        email: user.email,
        message: 'Please verify your email before logging in.',
      });
    }

    // Clear verification tokens once user logs in
    if (user.emailVerificationToken) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        title: user.title,
        bio: user.bio,
        hourlyRate: user.hourlyRate,
        location: user.location,
        company: user.company,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, skills, title, bio, hourlyRate, location, company } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name;
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (company !== undefined) user.company = company;
    if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate) || 0;

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  updateProfile,
};
