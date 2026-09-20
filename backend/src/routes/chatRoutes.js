const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProjectMessages,
  createMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { verifyProjectMember } = require('../middleware/workspaceMiddleware');

// Nested under /api/projects/:projectId/messages
router.get('/', protect, verifyProjectMember, getProjectMessages);
router.post('/', protect, verifyProjectMember, createMessage);

module.exports = router;
