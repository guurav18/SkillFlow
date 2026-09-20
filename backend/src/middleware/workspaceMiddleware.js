const Project = require('../models/Project');

const verifyProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.',
      });
    }

    const project = await Project.findById(projectId)
      .populate('client', 'name email company')
      .populate('hiredFreelancer', 'name email title skills bio')
      .populate('assignedFreelancers', 'name email title skills bio');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const userId = req.user._id.toString();
    const isClient = project.client && project.client._id.toString() === userId;

    // Check against the full assignedFreelancers array (multi-freelancer support)
    const isFreelancer = [
      ...(project.assignedFreelancers || []),
      ...(project.hiredFreelancer ? [project.hiredFreelancer] : []),
    ].some((freelancer) => freelancer._id.toString() === userId);
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project workspace.',
      });
    }

    req.project = project;
    req.isWorkspaceClient = isClient;
    req.isWorkspaceFreelancer = isFreelancer;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyProjectMember };
