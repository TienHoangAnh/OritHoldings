const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  reopenJob,
} = require('../controllers/jobController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

// Employer jobs (history)
router.get('/mine', protect, authorize('employer'), getMyJobs);
router.put('/:id/reopen', protect, authorize('employer'), reopenJob);

router.get('/', optionalProtect, getJobs);
router.post('/', protect, authorize('employer'), createJob);
router
  .route('/:id')
  .get(getJob)
  .put(protect, authorize('employer'), updateJob)
  .delete(protect, authorize('employer'), deleteJob);

module.exports = router;

