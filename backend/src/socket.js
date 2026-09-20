const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Project = require('./models/Project');
const Message = require('./models/Message');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'workflow_ai_super_secret_jwt_key_2026_dev'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]:', err.message);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.user.name} (${socket.user.role}) - Socket ID: ${socket.id}`);

    // Join Project Chat & Workspace Room
    socket.on('join_project', async ({ projectId }) => {
      try {
        if (!projectId) {
          return socket.emit('error_message', 'Project ID is required.');
        }

        const project = await Project.findById(projectId);
        if (!project) {
          return socket.emit('error_message', 'Project not found.');
        }

        const userId = socket.user._id.toString();
        const isClient = project.client && project.client.toString() === userId;
        const isFreelancer =
          project.hiredFreelancer &&
          project.hiredFreelancer.toString() === userId;
        const isAdmin = socket.user.role === 'admin';

        if (!isClient && !isFreelancer && !isAdmin) {
          console.warn(`[Socket Unauthorized]: User ${socket.user.name} tried to access project ${projectId}`);
          return socket.emit('error_message', 'Forbidden: You are not a member of this project.');
        }

        const roomName = `project:${projectId}`;
        socket.join(roomName);
        console.log(`[Socket Room Joined]: ${socket.user.name} joined ${roomName}`);

        socket.emit('joined_project', {
          projectId,
          room: roomName,
          status: 'success',
        });
      } catch (error) {
        console.error('[Socket join_project error]:', error.message);
        socket.emit('error_message', 'Server error joining project room.');
      }
    });

    // Leave Project Room
    socket.on('leave_project', ({ projectId }) => {
      const roomName = `project:${projectId}`;
      socket.leave(roomName);
      console.log(`[Socket Room Left]: ${socket.user.name} left ${roomName}`);
    });

    // Send Real-Time Chat Message
    socket.on('send_message', async ({ projectId, content }) => {
      try {
        if (!projectId || !content || !content.trim()) {
          return socket.emit('error_message', 'Message content and projectId are required.');
        }

        const project = await Project.findById(projectId);
        if (!project) {
          return socket.emit('error_message', 'Project not found.');
        }

        const userId = socket.user._id.toString();
        const isClient = project.client && project.client.toString() === userId;
        const isFreelancer =
          project.hiredFreelancer &&
          project.hiredFreelancer.toString() === userId;
        const isAdmin = socket.user.role === 'admin';

        if (!isClient && !isFreelancer && !isAdmin) {
          return socket.emit('error_message', 'Forbidden: Not authorized to send messages in this project.');
        }

        // Determine receiver
        let receiverId = null;
        if (isClient) {
          receiverId = project.hiredFreelancer;
        } else if (isFreelancer) {
          receiverId = project.client;
        }

        // Save message to MongoDB
        const message = await Message.create({
          project: project._id,
          sender: socket.user._id,
          receiver: receiverId,
          content: content.trim(),
        });

        await message.populate('sender', 'name email role');

        const roomName = `project:${projectId}`;
        // Broadcast to all sockets in this project room (including sender)
        io.to(roomName).emit('new_message', {
          projectId,
          message,
        });
      } catch (error) {
        console.error('[Socket send_message error]:', error.message);
        socket.emit('error_message', 'Failed to deliver message.');
      }
    });

    // Typing Indicators
    socket.on('typing', ({ projectId, isTyping }) => {
      const roomName = `project:${projectId}`;
      socket.to(roomName).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        isTyping,
      });
    });

    // Real-Time Task / Kanban Updates broadcast
    socket.on('task_change', ({ projectId, task, action }) => {
      const roomName = `project:${projectId}`;
      socket.to(roomName).emit('task_updated', {
        task,
        action, // 'created', 'updated', 'deleted', 'status_changed'
        updatedBy: socket.user.name,
      });
    });

    // Real-Time Milestone Updates broadcast
    socket.on('milestone_change', ({ projectId, milestone, action }) => {
      const roomName = `project:${projectId}`;
      socket.to(roomName).emit('milestone_updated', {
        milestone,
        action,
        updatedBy: socket.user.name,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.user.name} (${socket.id})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet');
  }
  return io;
};

module.exports = { initSocket, getIO };
