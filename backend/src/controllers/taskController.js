const Task = require('../models/Task');
const Project = require('../models/Project');
const { createNotification } = require('../utils/notifications');

// @desc    Create a new task in a project workspace
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Project Members)
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status } = req.body;
    const project = req.project;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task title.',
      });
    }

    const userId = req.user._id.toString();
    const isClient = project.client && project.client._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    // Only clients and admins can create tasks
    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project client can create tasks.',
      });
    }

    // Preserve the existing client workflow: when no assignee is supplied,
    // use the project's primary hired freelancer.
    const resolvedAssignee = assignedTo || project.hiredFreelancer || project.assignedFreelancers?.[0];
    const resolvedAssigneeId = resolvedAssignee?._id || resolvedAssignee;
    if (!resolvedAssignee) {
      return res.status(400).json({
        success: false,
        message: 'Please select a freelancer to assign this task to.',
      });
    }

    // Validate: assignedTo must be in the project’s assignedFreelancers list
    const projectFreelancerIds = [
      ...(project.assignedFreelancers || []),
      ...(project.hiredFreelancer ? [project.hiredFreelancer] : []),
    ].map((f) => (f._id || f).toString());

    if (projectFreelancerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hired freelancers are available for this project. Please hire a freelancer first.',
      });
    }

    if (!projectFreelancerIds.includes(resolvedAssigneeId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: The selected freelancer is not hired for this project.',
      });
    }

    // Freelancers cannot directly create tasks in ‘done’ status
    let initialStatus = status || 'todo';
    if (initialStatus === 'done' && !isClient && !isAdmin) {
      initialStatus = 'todo';
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      project: project._id,
      assignedTo: resolvedAssigneeId,
      createdBy: req.user._id,
      status: initialStatus,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private (Project Members)
const getProjectTasks = async (req, res, next) => {
  try {
    const project = req.project;
    const { status, priority, search } = req.query;

    let query = { project: project._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email title')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate Task Metrics
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const review = tasks.filter((t) => t.status === 'review').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const changesRequestedCount = tasks.filter((t) => t.changesRequested).length;
    const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      count: tasks.length,
      metrics: {
        total,
        todo,
        inProgress,
        review,
        done,
        changesRequestedCount,
        progressPercent,
      },
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private (Project Members)
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('project', 'title status client hiredFreelancer assignedFreelancers');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Verify membership
    const userId = req.user._id.toString();
    const proj = task.project;
    const isMember =
      proj.client.toString() === userId ||
      (proj.assignedFreelancers || []).some((id) => id.toString() === userId) ||
      req.user.role === 'admin';

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have access to this task.',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task (details, priority, assignee, status)
// @route   PUT /api/tasks/:id
// @access  Private (Project Members)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userId = req.user._id.toString();
    const proj = task.project;
    const isClient = proj.client.toString() === userId;

    // Check if user is one of the assigned freelancers
    const assignedFreelancerIds = [
      ...(proj.assignedFreelancers || []),
      ...(proj.hiredFreelancer ? [proj.hiredFreelancer] : []),
    ].map((freelancer) => (freelancer._id || freelancer).toString());
    const isFreelancer = assignedFreelancerIds.includes(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update this task.',
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // ENFORCE WORKFLOW RULES:
    // Freelancers CANNOT set status to 'done' directly. They must submit for review.
    if (status === 'done' && isFreelancer && !isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Freelancers cannot directly mark tasks as done. Please submit the task for client review.',
      });
    }

    // Freelancers CANNOT change assignment
    if (assignedTo !== undefined && isFreelancer && !isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Freelancers cannot reassign tasks.',
      });
    }

    if (status !== undefined) {
      task.status = status;
      if (status === 'done') {
        task.approvedBy = req.user._id;
        task.approvedAt = new Date();
        task.changesRequested = false;
      }
    }

    // Client/Admin can edit full details including reassignment
    if (isClient || isAdmin || task.createdBy.toString() === userId) {
      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

      if (assignedTo !== undefined && assignedTo !== null) {
        const projFreelancerIds = [
          ...(proj.assignedFreelancers || []),
          ...(proj.hiredFreelancer ? [proj.hiredFreelancer] : []),
        ].map((f) => (f._id || f).toString());
        if (!projFreelancerIds.includes(assignedTo.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: The selected freelancer is not hired for this project.',
          });
        }
        task.assignedTo = assignedTo;
      } else if (assignedTo === null) {
        task.assignedTo = null;
      }
    }

    await task.save();

    await task.populate('assignedTo', 'name email title');
    await task.populate('createdBy', 'name email role');
    await task.populate('approvedBy', 'name email');
    await task.populate('reviewedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a task for client review & approval
// @route   POST /api/tasks/:id/submit-review
// @access  Private (Freelancer / Project Members)
const submitTaskForReview = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userId = req.user._id;
    const proj = task.project;
    const projectFreelancerIds = [
      ...(proj.assignedFreelancers || []),
      ...(proj.hiredFreelancer ? [proj.hiredFreelancer] : []),
    ].map((freelancer) => (freelancer._id || freelancer).toString());
    const isMember =
      proj.client.toString() === userId.toString() ||
      projectFreelancerIds.includes(userId.toString()) ||
      req.user.role === 'admin';

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not belong to this project.',
      });
    }

    task.status = 'review';
    task.submittedForReviewAt = new Date();
    task.changesRequested = false;

    await task.save();

    await createNotification({
      recipient: proj.client,
      type: 'task_review',
      title: 'Task awaiting your review',
      message: `${task.title} was submitted for review.`,
      project: proj._id,
      task: task._id,
    });

    await task.populate('assignedTo', 'name email title');
    await task.populate('createdBy', 'name email role');
    await task.populate('approvedBy', 'name email');
    await task.populate('reviewedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Task submitted for client review successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a reviewed task (Client only)
// @route   POST /api/tasks/:id/approve
// @access  Private (Client / Admin only)
const approveTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userId = req.user._id.toString();
    const isClient = task.project.client.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project client or admin can approve tasks.',
      });
    }

    task.status = 'done';
    task.approvedBy = req.user._id;
    task.approvedAt = new Date();
    task.changesRequested = false;

    await task.save();

    await createNotification({
      recipient: task.assignedTo,
      type: 'task_approved',
      title: 'Your task has been approved',
      message: `${task.title} was approved by the client.`,
      project: task.project._id,
      task: task._id,
    });

    await task.populate('assignedTo', 'name email title');
    await task.populate('createdBy', 'name email role');
    await task.populate('approvedBy', 'name email');
    await task.populate('reviewedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Task approved and marked as completed.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request changes on a task under review (Client only)
// @route   POST /api/tasks/:id/request-changes
// @access  Private (Client / Admin only)
const requestChanges = async (req, res, next) => {
  try {
    const { reviewComment } = req.body;
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userId = req.user._id.toString();
    const isClient = task.project.client.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project client or admin can request changes.',
      });
    }

    task.status = 'in_progress';
    task.changesRequested = true;
    task.reviewComment = reviewComment ? reviewComment.trim() : 'Changes requested by client.';
    task.reviewedBy = req.user._id;
    task.reviewedAt = new Date();

    await task.save();

    await createNotification({
      recipient: task.assignedTo,
      type: 'changes_requested',
      title: 'Changes requested on your task',
      message: task.reviewComment,
      project: task.project._id,
      task: task._id,
    });

    await task.populate('assignedTo', 'name email title');
    await task.populate('createdBy', 'name email role');
    await task.populate('approvedBy', 'name email');
    await task.populate('reviewedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Changes requested. Task moved back to In Progress.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Global Workflow items across all user projects
// @route   GET /api/tasks/workflow
// @access  Private (Client, Freelancer, Admin)
const getGlobalWorkflow = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let projectIds = [];

    if (req.user.role === 'client') {
      const clientProjects = await Project.find({ client: userId }).select('_id');
      projectIds = clientProjects.map((p) => p._id);
    } else if (req.user.role === 'freelancer') {
      // Use assignedFreelancers array for project lookup
      const freelancerProjects = await Project.find({
        $or: [{ assignedFreelancers: userId }, { hiredFreelancer: userId }],
      }).select('_id');
      projectIds = freelancerProjects.map((p) => p._id);
    } else if (req.user.role === 'admin') {
      const allProjects = await Project.find().select('_id');
      projectIds = allProjects.map((p) => p._id);
    }

    // Base query: tasks in user's projects
    let taskQuery = { project: { $in: projectIds } };

    // Freelancers see ONLY tasks assigned to them
    if (req.user.role === 'freelancer') {
      taskQuery.assignedTo = userId;
    }

    const tasks = await Task.find(taskQuery)
      .populate({
        path: 'project',
        select: 'title category status budget deadline client hiredFreelancer assignedFreelancers',
        populate: [
          { path: 'client', select: 'name email company' },
          { path: 'assignedFreelancers', select: 'name email title' },
        ],
      })
      .populate('assignedTo', 'name email title')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1 });

    // Calculate role-specific pending action count for the navigation badge
    let pendingActionCount = 0;
    if (req.user.role === 'client') {
      // Client action needed when task is in review
      pendingActionCount = tasks.filter((t) => t.status === 'review').length;
    } else if (req.user.role === 'freelancer') {
      // Freelancer action needed when changes requested on their tasks
      pendingActionCount = tasks.filter(
        (t) => t.changesRequested && t.status === 'in_progress'
      ).length;
    }

    return res.status(200).json({
      success: true,
      pendingActionCount,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Client / Admin only)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const userId = req.user._id.toString();
    const isClient = task.project.client.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project client or admin can delete tasks.',
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  submitTaskForReview,
  approveTask,
  requestChanges,
  getGlobalWorkflow,
  deleteTask,
};
