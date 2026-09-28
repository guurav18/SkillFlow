const express = require('express');
const router = express.Router();
const {
  getFreelancers,
  getFreelancerProfile,
  createReview,
  inviteFreelancer,
} = require('../controllers/freelancerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getFreelancers);
router.get('/:id', getFreelancerProfile);

// Protected routes (Clients only)
router.post('/:id/reviews', protect, authorize('client'), createReview);
router.post('/:id/invite', protect, authorize('client'), inviteFreelancer);

module.exports = router;
