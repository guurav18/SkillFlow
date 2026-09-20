const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');

// @desc    Get platform statistics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalProjects,
      openProjects,
      assignedProjects,
      completedProjects,
      totalApplications,
      recentUsers,
      recentProjects,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'open' }),
      Project.countDocuments({ status: 'assigned' }),
      Project.countDocuments({ status: 'completed' }),
      Application.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Project.find()
        .populate('client', 'name email')
        .populate('hiredFreelancer', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalClients,
        totalFreelancers,
        totalProjects,
        openProjects,
        assignedProjects,
        completedProjects,
        totalApplications,
      },
      recentUsers,
      recentProjects,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
};
