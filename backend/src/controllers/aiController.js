const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Application = require('../models/Application');
const { AIServiceError, generateProjectBreakdown, generateFreelancerMatch, estimateTaskEffort, analyzeProjectHealth, askProjectCopilot } = require('../services/aiService');

const isProjectMember = (project, user) => user.role === 'admin' || (project.client?._id || project.client)?.toString() === user._id.toString() || (project.assignedFreelancers || []).some((id) => (id._id || id).toString() === user._id.toString()) || (project.hiredFreelancer && (project.hiredFreelancer._id || project.hiredFreelancer).toString() === user._id.toString());
const baseProject = (project) => ({ id: project._id, title: project.title, description: project.description, category: project.category, skills: project.skills, deadline: project.deadline, status: project.status });
const taskContext = (task) => ({ id: task._id, title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate, changesRequested: task.changesRequested });
const milestoneContext = (milestone) => ({ id: milestone._id, title: milestone.title, status: milestone.status, progress: milestone.progress, dueDate: milestone.dueDate });

const projectBreakdown = async (req, res, next) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ success: false, message: 'Only clients can generate project breakdowns.' });
    const result = await generateProjectBreakdown({ title: String(req.body.title || '').slice(0, 200), description: String(req.body.description || '').slice(0, 4000), category: req.body.category, skills: Array.isArray(req.body.skills) ? req.body.skills.slice(0, 20) : [], budget: req.body.budget, deadline: req.body.deadline });
    res.json({ success: true, breakdown: result });
  } catch (error) { next(error); }
};

const freelancerMatch = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (req.user.role !== 'admin' && project.client.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the project client can request matching.' });
    const applications = await Application.find({ project: project._id, status: { $in: ['pending', 'accepted'] } }).populate('freelancer', 'name title skills bio hourlyRate');
    const candidates = applications.map((application) => application.freelancer).filter(Boolean);
    const matches = await Promise.all(candidates.map(async (freelancer) => ({ freelancer: { id: freelancer._id, name: freelancer.name, title: freelancer.title, skills: freelancer.skills }, match: await generateFreelancerMatch(baseProject(project), { name: freelancer.name, title: freelancer.title, skills: freelancer.skills, bio: freelancer.bio }) })));
    res.json({ success: true, matches });
  } catch (error) { next(error); }
};

const taskEstimate = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.projectId).populate('client', 'name');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (!isProjectMember(project, req.user)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const task = req.body.taskId ? await Task.findById(req.body.taskId) : null;
    if (task && task.project.toString() !== project._id.toString()) return res.status(403).json({ success: false, message: 'Task does not belong to this project.' });
    const result = await estimateTaskEffort(baseProject(project), taskContext(task || req.body));
    res.json({ success: true, estimate: result });
  } catch (error) { next(error); }
};

const getProjectContext = async (projectId) => {
  const project = await Project.findById(projectId).populate('client', 'name company').populate('assignedFreelancers', 'name title skills');
  if (!project) return null;
  const [tasks, milestones] = await Promise.all([Task.find({ project: project._id }).sort({ dueDate: 1, priority: -1 }), Milestone.find({ project: project._id }).sort({ dueDate: 1 })]);
  const now = new Date();
  const metrics = { totalTasks: tasks.length, completedTasks: tasks.filter((task) => task.status === 'done').length, pendingTasks: tasks.filter((task) => task.status !== 'done').length, reviewTasks: tasks.filter((task) => task.status === 'review').length, changesRequested: tasks.filter((task) => task.changesRequested).length, overdueTasks: tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== 'done').length, totalMilestones: milestones.length, completedMilestones: milestones.filter((milestone) => milestone.status === 'completed' || milestone.progress === 100).length };
  return { project: baseProject(project), members: (project.assignedFreelancers || []).map((member) => ({ name: member.name, title: member.title, skills: member.skills })), tasks: tasks.map(taskContext), milestones: milestones.map(milestoneContext), metrics };
};

const projectHealth = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('client', 'name').populate('assignedFreelancers', 'name title skills');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (!isProjectMember(project, req.user)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const context = await getProjectContext(req.params.projectId);
    const result = await analyzeProjectHealth(context);
    res.json({ success: true, health: result, metrics: context.metrics });
  } catch (error) { next(error); }
};

const projectCopilot = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('client', 'name').populate('assignedFreelancers', 'name title skills');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (!isProjectMember(project, req.user)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    if (!String(req.body.question || '').trim()) return res.status(400).json({ success: false, message: 'Please provide a question.' });
    const context = await getProjectContext(req.params.projectId);
    const result = await askProjectCopilot(context, req.body.question);
    res.json({ success: true, copilot: result });
  } catch (error) { next(error); }
};

const handleAIError = (error, req, res, next) => {
  if (error instanceof AIServiceError) return res.status(error.status).json({ success: false, message: error.message });
  return next(error);
};

module.exports = { projectBreakdown, freelancerMatch, taskEstimate, projectHealth, projectCopilot, handleAIError };