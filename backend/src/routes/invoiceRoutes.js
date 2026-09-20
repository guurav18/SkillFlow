const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getInvoices, getInvoice, getProjectInvoices } = require('../controllers/invoiceController');
const router = express.Router();
router.get('/', protect, getInvoices);
router.get('/project/:projectId', protect, getProjectInvoices);
router.get('/:id', protect, getInvoice);
module.exports = router;