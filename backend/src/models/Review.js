const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required'],
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating from 1 to 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    qualityRating: {
      type: Number,
      min: [1, 'Quality rating must be at least 1'],
      max: [5, 'Quality rating cannot exceed 5'],
      default: 5,
    },
    communicationRating: {
      type: Number,
      min: [1, 'Communication rating must be at least 1'],
      max: [5, 'Communication rating cannot exceed 5'],
      default: 5,
    },
    deadlineRating: {
      type: Number,
      min: [1, 'Deadline rating must be at least 1'],
      max: [5, 'Deadline rating cannot exceed 5'],
      default: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a feedback comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch reviews for a freelancer ordered by newest
reviewSchema.index({ freelancer: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
