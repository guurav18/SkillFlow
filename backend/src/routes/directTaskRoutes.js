const express = require('express');
const router = express.Router();
const {
  getTaskById,
  updateTask,
  deleteTask,
  submitTaskForReview,
  approveTask,
  requestChanges,
  getGlobalWorkflow,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Global Workflow across all user projects (must be defined before /:id)
router.get('/workflow', protect, getGlobalWorkflow);

// Direct task operations
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

// Task Approval & Review Workflow actions
router.post('/:id/submit-review', protect, submitTaskForReview);
router.post('/:id/approve', protect, approveTask);
router.post('/:id/request-changes', protect, requestChanges);

module.exports = router;
