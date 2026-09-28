const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // Review & Approval Workflow fields
    submittedForReviewAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    changesRequested: {
      type: Boolean,
      default: false,
    },
    // File Attachments (General task resources / specs / wireframes)
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, default: 0 },
        mimetype: { type: String, default: '' },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Deliverables submitted when task is sent for review
    deliverables: {
      notes: {
        type: String,
        trim: true,
        default: '',
      },
      links: [
        {
          label: { type: String, trim: true, default: 'Deliverable Link' },
          url: { type: String, trim: true, required: true },
        },
      ],
      attachments: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          size: { type: Number, default: 0 },
          mimetype: { type: String, default: '' },
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      submittedAt: {
        type: Date,
        default: null,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
