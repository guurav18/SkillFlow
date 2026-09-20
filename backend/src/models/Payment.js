const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: { type: String },
    status: { type: String, enum: ['created', 'pending', 'paid', 'failed', 'refunded'], default: 'created', index: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ milestone: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);