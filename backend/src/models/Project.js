const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a project category'],
      trim: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'AI & Machine Learning',
        'Data Science',
        'DevOps & Cloud',
        'Cybersecurity',
        'Content & Marketing',
        'Other',
      ],
      default: 'Web Development',
    },
    skills: {
      type: [String],
      required: [true, 'Please provide at least one required skill'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'A project must list at least one required skill',
      },
    },
    budget: {
      type: Number,
      required: [true, 'Please specify a project budget in USD'],
      min: [5, 'Budget must be at least $5'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a project deadline'],
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed'],
      default: 'open',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hiredFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // All freelancers hired/assigned to this project (supports multiple)
    assignedFreelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Helpful index for search & filtering
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
