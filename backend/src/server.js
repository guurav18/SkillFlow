const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const directTaskRoutes = require('./routes/directTaskRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const directMilestoneRoutes = require('./routes/directMilestoneRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Initialize Real-Time Socket.IO
initSocket(httpServer);

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'WorkFlow AI',
    phase: 4,
    realtime: 'Socket.IO active',
    time: new Date().toISOString(),
  });
});

// Mount Routes (Phase 1 + Phase 2)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Phase 2 Nested Workspace Routes
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/milestones', milestoneRoutes);
app.use('/api/projects/:projectId/messages', chatRoutes);

// Phase 2 Direct Resource Routes
app.use('/api/tasks', directTaskRoutes);
app.use('/api/milestones', directMilestoneRoutes);

// Phase 3 Business Layer
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(
    `[WorkFlow AI Server]: Running in ${
      process.env.NODE_ENV || 'development'
    } mode with Socket.IO on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

module.exports = { app, httpServer };
