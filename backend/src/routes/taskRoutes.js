const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { verifyProjectMember } = require('../middleware/workspaceMiddleware');

// Nested under /api/projects/:projectId/tasks
router.post('/', protect, verifyProjectMember, createTask);
router.get('/', protect, verifyProjectMember, getProjectTasks);

module.exports = router;
