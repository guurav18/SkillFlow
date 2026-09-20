const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'INR', uppercase: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'paid' },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);