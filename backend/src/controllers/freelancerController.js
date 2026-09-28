const User = require('../models/User');
const Review = require('../models/Review');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Application = require('../models/Application');

// @desc    Get all public freelancers with filters & search
// @route   GET /api/freelancers
// @access  Public
const getFreelancers = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      minRate,
      maxRate,
      sort = 'rating',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { role: 'freelancer' };

    // Search by name, title, or skills
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { title: searchRegex },
        { bio: searchRegex },
        { skills: { $in: [searchRegex] } },
      ];
    }

    // Filter by specific skill
    if (skill && skill.trim()) {
      query.skills = { $regex: new RegExp(`^${skill.trim()}$`, 'i') };
    }

    // Filter by hourly rate range
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    // Sorting
    let sortOption = {};
    if (sort === 'rate_asc') {
      sortOption = { hourlyRate: 1 };
    } else if (sort === 'rate_desc') {
      sortOption = { hourlyRate: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      // Default: top rated & total reviews
      sortOption = { averageRating: -1, totalReviews: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [freelancers, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -emailVerificationExpires')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    // Also get all unique skills in the system for filter pills
    const allSkills = await User.distinct('skills', { role: 'freelancer' });

    return res.status(200).json({
      success: true,
      freelancers,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      skillsList: allSkills.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single freelancer public profile details & reviews
// @route   GET /api/freelancers/:id
// @access  Public
const getFreelancerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const freelancer = await User.findOne({ _id: id, role: 'freelancer' })
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .lean();

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found.',
      });
    }

    // Fetch verified reviews for this freelancer
    const reviews = await Review.find({ freelancer: id })
      .populate('client', 'name company title')
      .populate('project', 'title category')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch completed projects involving this freelancer
    const completedProjects = await Project.find({
      $or: [{ hiredFreelancer: id }, { assignedFreelancers: id }],
      status: 'completed',
    })
      .select('title category budget deadline createdAt client')
      .populate('client', 'name company')
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean();

    // Compute detailed breakdown
    const totalReviews = reviews.length;
    let avgQuality = 5;
    let avgCommunication = 5;
    let avgDeadline = 5;

    if (totalReviews > 0) {
      const sumQuality = reviews.reduce((acc, r) => acc + (r.qualityRating || 5), 0);
      const sumCommunication = reviews.reduce((acc, r) => acc + (r.communicationRating || 5), 0);
      const sumDeadline = reviews.reduce((acc, r) => acc + (r.deadlineRating || 5), 0);

      avgQuality = Number((sumQuality / totalReviews).toFixed(1));
      avgCommunication = Number((sumCommunication / totalReviews).toFixed(1));
      avgDeadline = Number((sumDeadline / totalReviews).toFixed(1));
    }

    return res.status(200).json({
      success: true,
      freelancer: {
        ...freelancer,
        completedProjectsCount: completedProjects.length,
      },
      completedProjects,
      reviews,
      stats: {
        totalReviews,
        averageRating: freelancer.averageRating || 5.0,
        qualityRating: avgQuality,
        communicationRating: avgCommunication,
        deadlineRating: avgDeadline,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review for a freelancer
// @route   POST /api/freelancers/:id/reviews
// @access  Private (Client only)
const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, qualityRating, communicationRating, deadlineRating, comment, projectId } = req.body;

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an overall rating and a comment.',
      });
    }

    if (req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a review for your own profile.',
      });
    }

    const freelancer = await User.findOne({ _id: id, role: 'freelancer' });
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found.',
      });
    }

    // Check if client already reviewed this freelancer recently (within last 24h or for same project)
    if (projectId) {
      const existing = await Review.findOne({
        freelancer: id,
        client: req.user._id,
        project: projectId,
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this project.',
        });
      }
    }

    const newReview = await Review.create({
      freelancer: id,
      client: req.user._id,
      project: projectId || null,
      rating: Number(rating),
      qualityRating: qualityRating ? Number(qualityRating) : Number(rating),
      communicationRating: communicationRating ? Number(communicationRating) : Number(rating),
      deadlineRating: deadlineRating ? Number(deadlineRating) : Number(rating),
      comment: comment.trim(),
    });

    // Recalculate average rating & total reviews
    const allReviews = await Review.find({ freelancer: id });
    const totalRev = allReviews.length;
    const sumRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = Number((sumRatings / totalRev).toFixed(1));

    freelancer.averageRating = newAverage;
    freelancer.totalReviews = totalRev;
    await freelancer.save();

    // Create a notification for the freelancer
    await Notification.create({
      recipient: freelancer._id,
      type: 'review',
      title: 'New Client Review',
      message: `${req.user.name} gave you a ${rating}-star review: "${comment.trim().substring(0, 60)}..."`,
      project: projectId || null,
    }).catch(() => {});

    // Populate client details for the response
    const populatedReview = await Review.findById(newReview._id)
      .populate('client', 'name company title')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review: populatedReview,
      averageRating: newAverage,
      totalReviews: totalRev,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a freelancer to a project
// @route   POST /api/freelancers/:id/invite
// @access  Private (Client only)
const inviteFreelancer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { projectId, message } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a project to invite the freelancer to.',
      });
    }

    // Verify freelancer exists
    const freelancer = await User.findOne({ _id: id, role: 'freelancer' });
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found.',
      });
    }

    // Verify project belongs to client and is open
    const project = await Project.findOne({
      _id: projectId,
      client: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to invite to this project.',
      });
    }

    // Check if freelancer already applied or is already invited
    let application = await Application.findOne({
      project: projectId,
      freelancer: id,
    });

    if (!application) {
      application = await Application.create({
        project: projectId,
        freelancer: id,
        proposal: message?.trim() || `Client ${req.user.name} invited you to collaborate on ${project.title}.`,
        bidAmount: project.budget || 50,
        estimatedDays: 7,
        status: 'pending',
      });
    }

    // Send notification to freelancer
    await Notification.create({
      recipient: freelancer._id,
      type: 'invitation',
      title: 'Project Invitation!',
      message: `${req.user.name} invited you to work on "${project.title}".`,
      project: project._id,
    });

    return res.status(200).json({
      success: true,
      message: `Invitation successfully sent to ${freelancer.name}!`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFreelancers,
  getFreelancerProfile,
  createReview,
  inviteFreelancer,
};
