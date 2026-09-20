const Message = require('../models/Message');

// @desc    Get project chat history
// @route   GET /api/projects/:projectId/messages
// @access  Private (Project Members)
const getProjectMessages = async (req, res, next) => {
  try {
    const project = req.project;

    const messages = await Message.find({ project: project._id })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a chat message via HTTP (fallback)
// @route   POST /api/projects/:projectId/messages
// @access  Private (Project Members)
const createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const project = req.project;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.',
      });
    }

    const currentUserId = req.user._id.toString();
    const clientId = project.client ? project.client._id.toString() : null;
    const freelancerId = project.hiredFreelancer ? project.hiredFreelancer._id.toString() : null;

    // Determine receiver
    let receiverId = null;
    if (currentUserId === clientId) {
      receiverId = freelancerId;
    } else if (currentUserId === freelancerId) {
      receiverId = clientId;
    }

    const message = await Message.create({
      project: project._id,
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    await message.populate('sender', 'name email role');

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectMessages,
  createMessage,
};
