const express = require('express');
const router = express.Router();
const {
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');

router.put('/:id', protect, updateMilestone);
router.delete('/:id', protect, deleteMilestone);

module.exports = router;
