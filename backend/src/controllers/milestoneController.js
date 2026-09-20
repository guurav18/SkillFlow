const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const { createNotifications } = require('../utils/notifications');

// @desc    Create a milestone for a project
// @route   POST /api/projects/:projectId/milestones
// @access  Private (Client / Admin)
const createMilestone = async (req, res, next) => {
  try {
    const { title, description, dueDate, progress, status, amount } = req.body;
    const project = req.project;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a milestone title.',
      });
    }

    const milestone = await Milestone.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      amount: amount !== undefined ? Number(amount) : 0,
      project: project._id,
      dueDate: dueDate ? new Date(dueDate) : null,
      progress: Number(progress) || 0,
      status: status || 'pending',
      createdBy: req.user._id,
    });

    await milestone.populate('createdBy', 'name email role');
    await createNotifications(project.assignedFreelancers || [], {
      type: 'milestone_created',
      title: 'New milestone created',
      message: `${milestone.title} was added to ${project.title}.`,
      project: project._id,
      milestone: milestone._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Milestone created successfully.',
      milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all milestones for a project
// @route   GET /api/projects/:projectId/milestones
// @access  Private (Project Members)
const getProjectMilestones = async (req, res, next) => {
  try {
    const project = req.project;

    const milestones = await Milestone.find({ project: project._id })
      .populate('createdBy', 'name email role')
      .sort({ dueDate: 1, createdAt: 1 });

    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'completed' || m.progress === 100).length;
    const inProgress = milestones.filter((m) => m.status === 'in_progress').length;
    const pending = milestones.filter((m) => m.status === 'pending').length;
    const overallProgress =
      total > 0
        ? Math.round(
            milestones.reduce((acc, m) => acc + (m.progress || 0), 0) / total
          )
        : 0;

    return res.status(200).json({
      success: true,
      count: total,
      metrics: {
        total,
        completed,
        inProgress,
        pending,
        overallProgress,
      },
      milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone progress/status/details
// @route   PUT /api/milestones/:id
// @access  Private (Project Members)
const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('project');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.',
      });
    }

    const userId = req.user._id.toString();
    const proj = milestone.project;
    const isClient = proj.client.toString() === userId;
    const isFreelancer =
      proj.hiredFreelancer && proj.hiredFreelancer.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this milestone.',
      });
    }

    const { title, description, dueDate, progress, status } = req.body;

    // Both can update progress and status
    if (progress !== undefined) {
      const parsedProgress = Math.min(100, Math.max(0, Number(progress)));
      milestone.progress = parsedProgress;
      if (parsedProgress === 100 && milestone.status !== 'completed') {
        milestone.status = 'completed';
      } else if (parsedProgress > 0 && parsedProgress < 100 && milestone.status === 'pending') {
        milestone.status = 'in_progress';
      }
    }

    if (status !== undefined) {
      milestone.status = status;
      if (status === 'completed' && milestone.progress < 100) {
        milestone.progress = 100;
      }
    }

    // Client/Admin can edit title/description/date
    if (isClient || isAdmin) {
      if (title !== undefined) milestone.title = title.trim();
      if (description !== undefined) milestone.description = description.trim();
      if (dueDate !== undefined) milestone.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await milestone.save();
    await milestone.populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Milestone updated successfully.',
      milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Client / Admin only)
const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('project');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.',
      });
    }

    const userId = req.user._id.toString();
    const isClient = milestone.project.client.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project client or admin can delete milestones.',
      });
    }

    await milestone.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMilestone,
  getProjectMilestones,
  updateMilestone,
  deleteMilestone,
};
