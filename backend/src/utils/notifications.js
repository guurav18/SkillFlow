const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, project, task, milestone, payment }) => {
  if (!recipient) return null;
  return Notification.create({ recipient, type, title, message, project, task, milestone, payment });
};

const createNotifications = async (recipients, data) => {
  const uniqueRecipients = [...new Set(recipients.filter(Boolean).map((recipient) => (recipient._id || recipient).toString()))];
  if (!uniqueRecipients.length) return [];
  return Notification.insertMany(uniqueRecipients.map((recipient) => ({ ...data, recipient })));
};

module.exports = { createNotification, createNotifications };