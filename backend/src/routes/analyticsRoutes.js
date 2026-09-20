const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { clientAnalytics, freelancerAnalytics, adminAnalytics } = require('../controllers/analyticsController');
const router = express.Router();
router.get('/client', protect, authorize('client'), clientAnalytics);
router.get('/freelancer', protect, authorize('freelancer'), freelancerAnalytics);
router.get('/admin', protect, authorize('admin'), adminAnalytics);
module.exports = router;