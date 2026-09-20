const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Counter = require('../models/Counter');
const { createNotifications } = require('../utils/notifications');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

const canAccessPayment = (payment, user) =>
  user.role === 'admin' || payment.client.toString() === user._id.toString() || payment.freelancer.toString() === user._id.toString();

const createOrder = async (req, res, next) => {
  try {
    const { projectId, milestoneId } = req.body;
    const project = await Project.findById(projectId);
    const milestone = await Milestone.findById(milestoneId);
    if (!project || !milestone || milestone.project.toString() !== project._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid project or milestone.' });
    }
    if (req.user.role !== 'client' || project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project client can create a payment.' });
    }
    const freelancer = project.hiredFreelancer || project.assignedFreelancers?.[0];
    if (!freelancer) return res.status(400).json({ success: false, message: 'This project has no hired freelancer.' });
    if (!Number.isFinite(milestone.amount) || milestone.amount <= 0) {
      return res.status(400).json({ success: false, message: 'This milestone does not have a payable amount.' });
    }
    const alreadyPaid = await Payment.findOne({ milestone: milestone._id, status: 'paid' });
    if (alreadyPaid) return res.status(409).json({ success: false, message: 'This milestone has already been paid.', payment: alreadyPaid });
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay is not configured on the server.' });

    const order = await razorpay.orders.create({ amount: Math.round(milestone.amount * 100), currency: 'INR', receipt: `milestone_${milestone._id}` });
    const payment = await Payment.create({ project: project._id, milestone: milestone._id, client: project.client, freelancer, amount: milestone.amount, razorpayOrderId: order.id, status: 'created' });
    return res.status(201).json({ success: true, keyId: process.env.RAZORPAY_KEY_ID, order, payment });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    const payment = await Payment.findOne({ razorpayOrderId: orderId }).populate('project milestone');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found.' });
    if (payment.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized to verify this payment.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex');
    if (!signature || !process.env.RAZORPAY_KEY_SECRET || expected !== signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }
    if (payment.status === 'paid') return res.status(200).json({ success: true, payment });
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();
    const sequence = await Counter.findOneAndUpdate({ _id: 'invoice' }, { $inc: { sequence: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const invoice = await Invoice.create({ invoiceNumber: `WF-${new Date().getFullYear()}-${String(sequence.sequence).padStart(5, '0')}`, project: payment.project._id, milestone: payment.milestone._id, payment: payment._id, client: payment.client, freelancer: payment.freelancer, amount: payment.amount, currency: payment.currency, status: 'paid', paidAt: payment.paidAt });
    await createNotifications([payment.client, payment.freelancer], { type: 'payment_success', title: 'Payment successful', message: `Milestone payment of ${payment.currency} ${payment.amount} was completed.`, project: payment.project._id, milestone: payment.milestone._id, payment: payment._id });
    await createNotifications([payment.client, payment.freelancer], { type: 'invoice_generated', title: 'Invoice generated', message: `Invoice ${invoice.invoiceNumber} is ready.`, project: payment.project._id, milestone: payment.milestone._id, payment: payment._id });
    return res.status(200).json({ success: true, payment, invoice });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'An invoice already exists for this payment.' });
    next(error);
  }
};

const getProjectPayments = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    const member = req.user.role === 'admin' || project.client.toString() === req.user._id.toString() || project.assignedFreelancers.some((id) => id.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const payments = await Payment.find({ project: project._id }).populate('milestone', 'title amount status').sort({ createdAt: -1 });
    return res.json({ success: true, payments });
  } catch (error) { next(error); }
};

const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('project milestone client freelancer', 'title name email amount status');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    if (!canAccessPayment(payment, req.user)) return res.status(403).json({ success: false, message: 'Forbidden.' });
    return res.json({ success: true, payment });
  } catch (error) { next(error); }
};

module.exports = { createOrder, verifyPayment, getProjectPayments, getPayment };