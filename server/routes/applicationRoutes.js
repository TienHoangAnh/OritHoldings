const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getUnseenCount,
  getUnseenApplications,
  markApplicationSeen,
  getEmployerUnseenApplications,
  markEmployerSeen,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:jobId', protect, authorize('applicant'), createApplication);
router.get('/my', protect, authorize('applicant'), getMyApplications);
router.get('/unseen-count', protect, authorize('applicant'), getUnseenCount);
router.get('/unseen', protect, authorize('applicant'), getUnseenApplications);
router.patch('/:id/seen', protect, authorize('applicant'), markApplicationSeen);
router.get('/employer/unseen', protect, authorize('employer'), getEmployerUnseenApplications);
router.patch('/:id/employer-seen', protect, authorize('employer'), markEmployerSeen);
router.get(
  '/job/:jobId',
  protect,
  authorize('employer'),
  getJobApplications
);

// Update application status (Employer only)
router.put(
  '/:id/status',
  protect,
  authorize('employer'),
  updateApplicationStatus
);

module.exports = router;

