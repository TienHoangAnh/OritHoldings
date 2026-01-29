const User = require('../models/User');
const Application = require('../models/Application');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Get user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Authorization rules:
    // 1. User can view their own profile
    // 2. Employer can view applicant profile if applicant applied to any of their jobs
    // 3. Otherwise, return limited info only

    let canViewFullProfile = false;

    if (currentUser.id === userId) {
      // User viewing own profile
      canViewFullProfile = true;
    } else if (currentUser.role === 'employer' && user.role === 'applicant') {
      // Employer viewing applicant profile
      // Check if applicant applied to any of employer's jobs
      const Job = require('../models/Job');
      const employerJobs = await Job.find({ createdBy: currentUser.id }).distinct('_id');
      
      if (employerJobs.length > 0) {
        const hasApplication = await Application.findOne({
          applicant: userId,
          job: { $in: employerJobs },
        });

        if (hasApplication) {
          canViewFullProfile = true;
        }
      }
    }

    if (canViewFullProfile) {
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt,
        },
      });
    } else {
      // Return limited info
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          role: user.role,
          // Only show basic profile if exists
          profile: user.profile?.avatar
            ? {
                avatar: user.profile.avatar,
              }
            : null,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (Applicant only)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar, bio, skills, experience, education } = req.body;

    // Only applicants can update profile
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can update profile',
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update profile
    user.profile = {
      avatar: avatar || user.profile?.avatar || '',
      bio: bio !== undefined ? bio : user.profile?.bio || '',
      skills: Array.isArray(skills) ? skills : user.profile?.skills || [],
      experience: experience !== undefined ? experience : user.profile?.experience || '',
      education: education !== undefined ? education : user.profile?.education || '',
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

