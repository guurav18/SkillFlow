const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Application must belong to a project'],
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a freelancer'],
    },
    proposal: {
      type: String,
      required: [true, 'Please provide a proposal message'],
      trim: true,
      minlength: [20, 'Proposal should be at least 20 characters'],
    },
    bidAmount: {
      type: Number,
      required: [true, 'Please enter your proposed bid amount'],
      min: [1, 'Bid amount must be positive'],
    },
    estimatedDays: {
      type: Number,
      default: 7,
      min: [1, 'Estimated delivery must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same freelancer from applying multiple times to the same project
applicationSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
