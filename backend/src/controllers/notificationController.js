const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).populate('project', 'title').populate('task', 'title').populate('milestone', 'title').populate('payment', 'amount currency status').sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (error) { next(error); }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, notification });
  } catch (error) { next(error); }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markRead, markAllRead };