const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Get user profile by ID
router.get('/:id', protect, getUserProfile);

// Update own profile (applicant only)
router.put('/profile', protect, authorize('applicant'), updateProfile);

module.exports = router;

