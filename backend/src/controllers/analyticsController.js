const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const User = require('../models/User');

const projectStats = async (query) => {
  const [totalProjects, activeProjects, completedProjects] = await Promise.all([
    Project.countDocuments(query), Project.countDocuments({ ...query, status: { $ne: 'completed' } }), Project.countDocuments({ ...query, status: 'completed' }),
  ]);
  return { totalProjects, activeProjects, completedProjects };
};

const personalAnalytics = async (req, res, next) => {
  try {
    const isClient = req.user.role === 'client';
    const projectQuery = isClient ? { client: req.user._id } : { assignedFreelancers: req.user._id };
    const projects = await Project.find(projectQuery).select('_id');
    const projectIds = projects.map((project) => project._id);
    const paymentQuery = isClient ? { client: req.user._id } : { freelancer: req.user._id };
    const [stats, payments, completedTasks, pendingTasks, completedMilestones] = await Promise.all([
      projectStats(projectQuery), Payment.find(paymentQuery).select('amount status currency'), Task.countDocuments({ project: { $in: projectIds }, status: 'done', ...(isClient ? {} : { assignedTo: req.user._id }) }), Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' }, ...(isClient ? {} : { assignedTo: req.user._id }) }), Milestone.countDocuments({ project: { $in: projectIds }, status: 'completed' }),
    ]);
    const paid = payments.filter((payment) => payment.status === 'paid');
    const pending = payments.filter((payment) => ['created', 'pending'].includes(payment.status));
    res.json({ success: true, role: req.user.role, ...stats, totalSpending: isClient ? paid.reduce((sum, payment) => sum + payment.amount, 0) : undefined, totalEarnings: !isClient ? paid.reduce((sum, payment) => sum + payment.amount, 0) : undefined, pendingPayments: pending.reduce((sum, payment) => sum + payment.amount, 0), paidPayments: paid.reduce((sum, payment) => sum + payment.amount, 0), completedTasks, pendingTasks, completedMilestones, paymentCount: payments.length });
  } catch (error) { next(error); }
};

const adminAnalytics = async (req, res, next) => {
  try {
    const [users, clients, freelancers, projects, stats, payments] = await Promise.all([User.countDocuments(), User.countDocuments({ role: 'client' }), User.countDocuments({ role: 'freelancer' }), Project.countDocuments(), projectStats({}), Payment.find().select('amount status')]);
    res.json({ success: true, totalUsers: users, totalClients: clients, totalFreelancers: freelancers, totalProjects: projects, ...stats, totalTransactionVolume: payments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0), successfulPayments: payments.filter((payment) => payment.status === 'paid').length, failedPayments: payments.filter((payment) => payment.status === 'failed').length });
  } catch (error) { next(error); }
};

module.exports = { clientAnalytics: personalAnalytics, freelancerAnalytics: personalAnalytics, adminAnalytics };