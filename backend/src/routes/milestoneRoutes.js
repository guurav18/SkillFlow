const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createMilestone,
  getProjectMilestones,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');
const { verifyProjectMember } = require('../middleware/workspaceMiddleware');

// Nested under /api/projects/:projectId/milestones
router.post('/', protect, verifyProjectMember, createMilestone);
router.get('/', protect, verifyProjectMember, getProjectMilestones);

module.exports = router;
