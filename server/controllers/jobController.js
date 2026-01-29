const Job = require('../models/Job');
const Application = require('../models/Application');
const mongoose = require('mongoose');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, type, location, includeApplicationStatus } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Đếm số lượng applications cho mỗi job
    const now = new Date();
    const jobsWithApplicationsCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await Application.countDocuments({
          job: job._id,
        });
        const start = job.applicationStartDate ? new Date(job.applicationStartDate) : null;
        const end = job.applicationEndDate ? new Date(job.applicationEndDate) : null;
        const isOpen =
          start &&
          end &&
          !Number.isNaN(start.getTime()) &&
          !Number.isNaN(end.getTime()) &&
          now >= start &&
          now <= end;
        return {
          ...job.toObject(),
          applicationsCount,
          isOpen,
        };
      })
    );

    // Optional: attach applicant's latest application status per job (no other users' data)
    let finalJobs = jobsWithApplicationsCount;
    const shouldIncludeAppStatus =
      includeApplicationStatus === 'true' &&
      req.user &&
      req.user.role === 'applicant';

    if (shouldIncludeAppStatus) {
      const jobIds = jobsWithApplicationsCount.map((j) => j._id);
      const latestStatuses = await Application.aggregate([
        {
          $match: {
            applicant: new mongoose.Types.ObjectId(req.user.id),
            job: { $in: jobIds.map((id) => new mongoose.Types.ObjectId(id)) },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$job',
            status: { $first: '$status' },
          },
        },
      ]);

      const statusMap = new Map(
        latestStatuses.map((s) => [String(s._id), s.status])
      );

      finalJobs = jobsWithApplicationsCount.map((j) => ({
        ...j,
        applicationStatus: statusMap.get(String(j._id)) || null,
      }));
    } else {
      finalJobs = jobsWithApplicationsCount.map((j) => ({
        ...j,
        applicationStatus: null,
      }));
    }

    res.status(200).json({
      success: true,
      count: finalJobs.length,
      data: finalJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        isOpen:
          job.applicationStartDate &&
          job.applicationEndDate &&
          new Date() >= new Date(job.applicationStartDate) &&
          new Date() <= new Date(job.applicationEndDate),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salary,
      type,
      applicationStartDate,
      applicationEndDate,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !company ||
      !location ||
      !salary ||
      !type ||
      !applicationStartDate ||
      !applicationEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (!['Full-time', 'Part-time', 'Remote'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Job type must be Full-time, Part-time, or Remote',
      });
    }

    const start = new Date(applicationStartDate);
    const end = new Date(applicationEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application date(s)',
      });
    }
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'applicationStartDate must be before applicationEndDate',
      });
    }

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      type,
      applicationStartDate: start,
      applicationEndDate: end,
      createdBy: req.user.id,
    });

    const populatedJob = await Job.findById(job._id).populate(
      'createdBy',
      'name email'
    );

    res.status(201).json({
      success: true,
      data: populatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Make sure user is job owner
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    // Validate application dates if provided
    if (req.body.applicationStartDate || req.body.applicationEndDate) {
      const start = req.body.applicationStartDate
        ? new Date(req.body.applicationStartDate)
        : new Date(job.applicationStartDate);
      const end = req.body.applicationEndDate
        ? new Date(req.body.applicationEndDate)
        : new Date(job.applicationEndDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application date(s)',
        });
      }
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'applicationStartDate must be before applicationEndDate',
        });
      }
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Make sure user is job owner
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get employer jobs (optionally include expired)
// @route   GET /api/jobs/mine?includeExpired=true
// @access  Private (Employer only)
exports.getMyJobs = async (req, res) => {
  try {
    const includeExpired = req.query.includeExpired === 'true';
    const now = new Date();

    // Use aggregation to avoid N+1 counting on dashboard
    const match = {
      createdBy: new mongoose.Types.ObjectId(req.user.id),
    };
    if (!includeExpired) {
      match.applicationEndDate = { $gte: now };
    }

    const jobs = await Job.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications',
        },
      },
      {
        $addFields: {
          applicationsCount: { $size: '$applications' },
        },
      },
      { $project: { applications: 0 } },
    ]);

    const jobsWithIsOpen = jobs.map((job) => {
      const start = job.applicationStartDate ? new Date(job.applicationStartDate) : null;
      const end = job.applicationEndDate ? new Date(job.applicationEndDate) : null;
      const isOpen =
        start &&
        end &&
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        now >= start &&
        now <= end;
      const isExpired = end && !Number.isNaN(end.getTime()) ? now > end : false;
      return { ...job, isOpen, isExpired };
    });

    res.status(200).json({
      success: true,
      count: jobsWithIsOpen.length,
      data: jobsWithIsOpen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Re-open / repost an expired job by updating application dates
// @route   PUT /api/jobs/:id/reopen
// @access  Private (Employer only)
exports.reopenJob = async (req, res) => {
  try {
    const { applicationStartDate, applicationEndDate } = req.body;
    if (!applicationStartDate || !applicationEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide applicationStartDate and applicationEndDate',
      });
    }

    const start = new Date(applicationStartDate);
    const end = new Date(applicationEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application date(s)',
      });
    }
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'applicationStartDate must be before applicationEndDate',
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // owner check
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reopen this job',
      });
    }

    job.applicationStartDate = start;
    job.applicationEndDate = end;
    await job.save();

    res.status(200).json({
      success: true,
      data: { ...job.toObject(), isOpen: new Date() >= start && new Date() <= end },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

