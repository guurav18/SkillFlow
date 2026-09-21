const Project = require('../models/Project');
const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Client only)
const createProject = async (req, res, next) => {
  try {
    const { title, description, category, skills, budget, deadline } = req.body;

    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, budget, and deadline.',
      });
    }

    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (parsedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one required skill.',
      });
    }

    const project = await Project.create({
      title,
      description,
      category: category || 'Web Development',
      skills: parsedSkills,
      budget: Number(budget),
      deadline: new Date(deadline),
      client: req.user._id,
      status: 'open',
    });

    await project.populate('client', 'name email company location');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get / Browse open projects with search & filtering
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const { search, category, skill, status, sort } = req.query;

    let query = {};

    // By default, browse shows open projects unless explicitly specified
    if (status) {
      query.status = status;
    } else {
      query.status = 'open';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skills: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'budget-high') sortOption = { budget: -1 };
    if (sort === 'budget-low') sortOption = { budget: 1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };

    const projects = await Project.find(query)
      .populate('client', 'name email company location')
      .populate('hiredFreelancer', 'name email title avatar')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Public / Authenticated
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company location bio createdAt')
      .populate('hiredFreelancer', 'name email title skills bio hourlyRate');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Also get application count
    const applicationCount = await Application.countDocuments({ project: project._id });

    return res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        applicationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get projects owned by client or hired by freelancer
// @route   GET /api/projects/my
// @access  Private
const getMyProjects = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'freelancer') {
      query.$or = [
        { hiredFreelancer: req.user._id },
        { assignedFreelancers: req.user._id },
      ];
    } else if (req.user.role === 'admin') {
      // Admin can see recent projects
      query = {};
    }

    const projects = await Project.find(query)
      .populate('client', 'name email company')
      .populate('hiredFreelancer', 'name email title skills')
      .sort({ createdAt: -1 });

    // For client projects, attach application counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const appCount = await Application.countDocuments({ project: p._id });
        return {
          ...p.toObject(),
          applicationCount: appCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: projectsWithCounts.length,
      projects: projectsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hire a freelancer for a project
// @route   POST /api/projects/:id/hire
// @access  Private (Client only)
const hireFreelancer = async (req, res, next) => {
  try {
    const { applicationId, freelancerId } = req.body;
    const projectId = req.params.id;

    // Validate project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Check ownership
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to hire for this project.',
      });
    }

    // Check project status — allow hiring to 'assigned' projects too (multi-freelancer)
    if (project.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This project is already completed. Cannot hire additional freelancers.',
      });
    }

    // Locate the application to hire
    let application;
    if (applicationId) {
      application = await Application.findOne({ _id: applicationId, project: projectId });
    } else if (freelancerId) {
      application = await Application.findOne({ freelancer: freelancerId, project: projectId });
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found for this freelancer and project.',
      });
    }

    const selectedFreelancerId = application.freelancer;

    // Check if already hired
    const alreadyHired = project.assignedFreelancers.some(
      (id) => id.toString() === selectedFreelancerId.toString()
    );
    if (alreadyHired) {
      return res.status(400).json({
        success: false,
        message: 'This freelancer is already hired for this project.',
      });
    }

    // 1. Accept this application
    application.status = 'accepted';
    await application.save();

    // 2. Update project: set hiredFreelancer (most recent) and push to assignedFreelancers array
    project.status = 'assigned';
    project.hiredFreelancer = selectedFreelancerId;
    if (!project.assignedFreelancers.includes(selectedFreelancerId)) {
      project.assignedFreelancers.push(selectedFreelancerId);
    }
    await project.save();

    await project.populate('client', 'name email company');
    await project.populate('hiredFreelancer', 'name email title skills bio hourlyRate');

    return res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully! Project status has been updated to assigned.',
      project,
      acceptedApplication: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all freelancers hired/assigned to a project
// @route   GET /api/projects/:id/freelancers
// @access  Private (Project Client / Admin)
const getProjectFreelancers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedFreelancers', 'name email title skills hourlyRate avatar')
      .populate('client', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Verify the requester is the client, a hired freelancer, or admin
    const userId = req.user._id.toString();
    const isClient = project.client._id.toString() === userId;
    const isAssigned = project.assignedFreelancers.some(
      (f) => f._id.toString() === userId
    );
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project.',
      });
    }

    return res.status(200).json({
      success: true,
      count: project.assignedFreelancers.length,
      freelancers: project.assignedFreelancers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getMyProjects,
  hireFreelancer,
  getProjectFreelancers,
};
