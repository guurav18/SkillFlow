const express = require('express');
const router = express.Router();
const { getMyApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my', protect, authorize('freelancer'), getMyApplications);

module.exports = router;
