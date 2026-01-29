const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    salary: {
      type: String,
      required: [true, 'Please provide salary information'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Remote'],
      required: [true, 'Please provide job type'],
    },
    applicationStartDate: {
      type: Date,
      required: [true, 'Please provide application start date'],
    },
    applicationEndDate: {
      type: Date,
      required: [true, 'Please provide application end date'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);

