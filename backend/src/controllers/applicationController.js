const Application = require('../models/Application');
const Project = require('../models/Project');

// @desc    Apply to an open project
// @route   POST /api/projects/:id/apply
// @access  Private (Freelancer only)
const applyToProject = async (req, res, next) => {
  try {
    const { proposal, bidAmount, estimatedDays } = req.body;
    const projectId = req.params.id;

    if (!proposal || !bidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide proposal text and bid amount.',
      });
    }

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Check project is open
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: `This project is ${project.status} and is no longer accepting new applications.`,
      });
    }

    // Check if freelancer is trying to apply to own project (if someone switched roles)
    if (project.client.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own project.',
      });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      project: projectId,
      freelancer: req.user._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this project.',
      });
    }

    const application = await Application.create({
      project: projectId,
      freelancer: req.user._id,
      proposal,
      bidAmount: Number(bidAmount),
      estimatedDays: Number(estimatedDays) || 7,
      status: 'pending',
    });

    await application.populate('freelancer', 'name email skills title bio hourlyRate location');
    await application.populate('project', 'title budget deadline status');

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific project
// @route   GET /api/projects/:id/applications
// @access  Private (Client / Admin)
const getProjectApplications = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Verify ownership (or admin)
    if (
      project.client.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applications for this project.',
      });
    }

    const applications = await Application.find({ project: projectId })
      .populate('freelancer', 'name email skills title bio hourlyRate location company')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications made by logged in freelancer
// @route   GET /api/applications/my
// @access  Private (Freelancer only)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ freelancer: req.user._id })
      .populate({
        path: 'project',
        select: 'title description budget deadline status category client hiredFreelancer',
        populate: {
          path: 'client',
          select: 'name email company',
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToProject,
  getProjectApplications,
  getMyApplications,
};
