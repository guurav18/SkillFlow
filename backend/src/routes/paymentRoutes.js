const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment, getProjectPayments, getPayment } = require('../controllers/paymentController');
const router = express.Router();
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/project/:projectId', protect, getProjectPayments);
router.get('/:id', protect, getPayment);
module.exports = router;