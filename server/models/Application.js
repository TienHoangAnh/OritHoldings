const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Please provide a cover letter'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Applicant notification: false when employer updates status; true after applicant views /my-applications
    isSeenByApplicant: {
      type: Boolean,
      default: false,
    },
    // For polling-based toast notifications (status changed timestamp)
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
    // Employer notification: false when applicant applies; true after employer sees it
    isSeenByEmployer: {
      type: Boolean,
      default: false,
    },
    // Explicit apply timestamp (separate from createdAt for clarity)
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
// Allow re-apply after rejection:
// - Block having multiple active applications (pending/accepted) for the same job+applicant
// - Allow multiple rejected applications (history)
applicationSchema.index(
  { job: 1, applicant: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
  }
);

module.exports = mongoose.model('Application', applicationSchema);

