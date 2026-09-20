const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  getMyProjects,
  hireFreelancer,
  getProjectFreelancers,
} = require('../controllers/projectController');
const {
  applyToProject,
  getProjectApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Projects CRUD & browse
router.post('/', protect, authorize('client'), createProject);
router.get('/', getProjects);
router.get('/my', protect, getMyProjects);
router.get('/:id', getProjectById);
router.post('/:id/hire', protect, authorize('client'), hireFreelancer);

// Get hired freelancers for a project (for task assignment dropdown)
router.get('/:id/freelancers', protect, getProjectFreelancers);

// Applications tied to project
router.post('/:id/apply', protect, authorize('freelancer'), applyToProject);
router.get('/:id/applications', protect, authorize('client', 'admin'), getProjectApplications);

module.exports = router;
