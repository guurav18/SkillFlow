const Invoice = require('../models/Invoice');

const accessFilter = (user) => (user.role === 'admin' ? {} : { $or: [{ client: user._id }, { freelancer: user._id }] });

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find(accessFilter(req.user)).populate('project', 'title').populate('milestone', 'title').populate('client freelancer', 'name email').sort({ issuedAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) { next(error); }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('project', 'title').populate('milestone', 'title').populate('client freelancer', 'name email');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    if (req.user.role !== 'admin' && invoice.client._id.toString() !== req.user._id.toString() && invoice.freelancer._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden.' });
    res.json({ success: true, invoice });
  } catch (error) { next(error); }
};

const getProjectInvoices = async (req, res, next) => {
  try {
    const query = { project: req.params.projectId, ...accessFilter(req.user) };
    const invoices = await Invoice.find(query).populate('project', 'title').populate('milestone', 'title').populate('client freelancer', 'name email').sort({ issuedAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) { next(error); }
};

module.exports = { getInvoices, getInvoice, getProjectInvoices };