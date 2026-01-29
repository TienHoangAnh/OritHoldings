const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for job
// @route   POST /api/applications/:jobId
// @access  Private (Applicant only)
exports.createApplication = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    // Validation
    if (!coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a cover letter',
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Business rule: can only apply within [applicationStartDate, applicationEndDate]
    const now = new Date();
    const start = new Date(job.applicationStartDate);
    const end = new Date(job.applicationEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'This job has invalid application dates',
      });
    }
    if (now < start || now > end) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications',
      });
    }

    // Business rule: allow re-apply ONLY after rejection
    // - pending: block
    // - accepted: block
    // - rejected: allow (create a NEW application, keep history)
    const latestApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    }).sort({ createdAt: -1 });

    if (latestApplication) {
      if (latestApplication.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your application is still pending for this job',
        });
      }
      if (latestApplication.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You have already been accepted for this job',
        });
      }
      // rejected => allow
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      // Applicant just created this application, so it is already "seen"
      isSeenByApplicant: true,
      // Employer should be notified about new apply
      isSeenByEmployer: false,
      appliedAt: new Date(),
    });

    const populatedApplication = await Application.findById(
      application._id
    ).populate('job', 'title company').populate('applicant', 'name email');

    res.status(201).json({
      success: true,
      data: populatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get my applications (Applicant)
// @route   GET /api/applications/my
// @access  Private (Applicant only)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.id,
    })
      .populate('job', 'title company location type salary createdAt')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });

    // Auto-mark as seen when applicant visits My Applications (recommended option A)
    // Only mark "updated statuses" as seen (accepted/rejected)
    await Application.updateMany(
      {
        applicant: req.user.id,
        status: { $ne: 'pending' },
        isSeenByApplicant: false,
      },
      { $set: { isSeenByApplicant: true } }
    );

    // Return shape includes status + isSeenByApplicant (and keep existing fields for UI)
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get applications for a job (Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
exports.getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Check if job exists and user is owner
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job',
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('job', 'title company')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update application status (accepted / rejected)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'",
      });
    }

    // Find application and populate job to check ownership
    const application = await Application.findById(applicationId)
      .populate('job', 'createdBy title company')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Employer must own the job
    if (application.job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    // Optional but preferred: status cannot be changed after it is set
    if (application.status && application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application status has already been set and cannot be changed',
      });
    }

    application.status = status;
    // Trigger applicant notification dot
    application.isSeenByApplicant = false;
    application.statusUpdatedAt = new Date();
    await application.save();

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unseen count for applicant notifications
// @route   GET /api/applications/unseen-count
// @access  Private (Applicant only)
exports.getUnseenCount = async (req, res) => {
  try {
    const count = await Application.countDocuments({
      applicant: req.user.id,
      status: { $ne: 'pending' },
      isSeenByApplicant: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unseen application status updates for toast notifications
// @route   GET /api/applications/unseen
// @access  Private (Applicant only)
exports.getUnseenApplications = async (req, res) => {
  try {
    const unseen = await Application.find({
      applicant: req.user.id,
      status: { $ne: 'pending' },
      isSeenByApplicant: false,
    })
      .populate('job', 'title company')
      .sort({ statusUpdatedAt: -1, createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: unseen.map((a) => ({
        _id: a._id,
        status: a.status,
        statusUpdatedAt: a.statusUpdatedAt,
        job: a.job
          ? { _id: a.job._id, title: a.job.title, company: a.job.company }
          : null,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark a single application as seen by applicant
// @route   PATCH /api/applications/:id/seen
// @access  Private (Applicant only)
exports.markApplicationSeen = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Applicant can only mark their own applications
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    application.isSeenByApplicant = true;
    await application.save();

    res.status(200).json({
      success: true,
      data: { _id: application._id, isSeenByApplicant: application.isSeenByApplicant },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unseen applications for employer (new applicants)
// @route   GET /api/applications/employer/unseen
// @access  Private (Employer only)
exports.getEmployerUnseenApplications = async (req, res) => {
  try {
    // Find applications where job.createdBy === employerId and isSeenByEmployer === false
    const unseen = await Application.find({ isSeenByEmployer: false })
      .populate('job', 'title createdBy')
      .populate('applicant', 'name')
      .sort({ appliedAt: -1, createdAt: -1 })
      .limit(10);

    // Filter by owner (after populate)
    const owned = unseen.filter(
      (a) => a.job && a.job.createdBy && a.job.createdBy.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      data: owned.map((a) => ({
        _id: a._id,
        job: a.job ? { _id: a.job._id, title: a.job.title } : null,
        applicant: a.applicant ? { _id: a.applicant._id, name: a.applicant.name } : null,
        appliedAt: a.appliedAt,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark employer notification as seen
// @route   PATCH /api/applications/:id/employer-seen
// @access  Private (Employer only)
exports.markEmployerSeen = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'createdBy');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Employer must own the job
    if (!application.job || application.job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    application.isSeenByEmployer = true;
    await application.save();

    res.status(200).json({
      success: true,
      data: { _id: application._id, isSeenByEmployer: application.isSeenByEmployer },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

