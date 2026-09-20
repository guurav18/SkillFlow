const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new client or freelancer
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
        message: 'An account with this email address already exists.',
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

    const user = await User.create({
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
    });

    const token = generateToken(user._id);

    return res.status(201).json({
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
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
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

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
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
  login,
  getMe,
  updateProfile,
};
