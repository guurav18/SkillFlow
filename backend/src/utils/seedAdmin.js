const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');

dotenv.config({ path: __dirname + '/../../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workflow_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB at', mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Application.deleteMany({});
    console.log('[Seed]: Cleared existing users, projects, applications.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'WorkFlow System Admin',
      email: 'admin@workflowai.com',
      password: 'password123',
      role: 'admin',
      title: 'Platform Administrator',
      bio: 'Oversees platform health, users, and marketplace integrity.',
    });
    console.log('[Seed]: Created Admin -> admin@workflowai.com / password123');

    // 2. Create Clients
    const client1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'client@workflowai.com',
      password: 'password123',
      role: 'client',
      title: 'Product Director',
      company: 'Apex Innovations',
      location: 'San Francisco, CA',
      bio: 'Leading product development at Apex Innovations. Hiring talented full-stack and AI engineers.',
    });

    const client2 = await User.create({
      name: 'Michael Chang',
      email: 'michael@fintechpulse.io',
      password: 'password123',
      role: 'client',
      title: 'Engineering Lead',
      company: 'FinPulse Labs',
      location: 'New York, NY',
      bio: 'Building next-generation real-time financial tracking and algorithmic dashboard tools.',
    });
    console.log('[Seed]: Created Clients -> client@workflowai.com / password123');

    // 3. Create Freelancers
    const freelancer1 = await User.create({
      name: 'Alex Rivera',
      email: 'freelancer@workflowai.com',
      password: 'password123',
      role: 'freelancer',
      title: 'Senior Full-Stack & React Specialist',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'TypeScript'],
      hourlyRate: 65,
      location: 'Austin, TX',
      bio: '7+ years building enterprise web apps, SaaS dashboards, and modern UI systems. Passionate about clean code and pixel perfection.',
    });

    const freelancer2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@codecraft.dev',
      password: 'password123',
      role: 'freelancer',
      title: 'Full-Stack Developer & Cloud Architect',
      skills: ['Python', 'FastAPI', 'React', 'Docker', 'AWS', 'PostgreSQL'],
      hourlyRate: 80,
      location: 'Seattle, WA',
      bio: 'Specialist in high-throughput microservices, API architecture, and modern cloud deployment.',
    });

    const freelancer3 = await User.create({
      name: 'David Kim',
      email: 'david@uxstudio.design',
      password: 'password123',
      role: 'freelancer',
      title: 'Lead UI/UX Designer & Frontend Dev',
      skills: ['Figma', 'UI/UX Design', 'React', 'Tailwind CSS', 'Design Systems'],
      hourlyRate: 55,
      location: 'Toronto, Canada',
      bio: 'Crafting intuitive digital experiences and translating complex data workflows into sleek SaaS interfaces.',
    });
    console.log('[Seed]: Created Freelancers -> freelancer@workflowai.com / password123');

    // 4. Create Sample Projects
    const project1 = await Project.create({
      title: 'Full-Stack SaaS Analytics Dashboard with Real-Time Metrics',
      description: 'We are seeking an experienced full-stack developer to build a modern analytics dashboard. The system requires secure user authentication, interactive charting, responsive layout, and robust REST APIs.',
      category: 'Web Development',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
      budget: 3200,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21), // 21 days from now
      client: client1._id,
      status: 'open',
    });

    const project2 = await Project.create({
      title: 'Mobile-Responsive Customer Portal for FinTech Application',
      description: 'Looking for a skilled frontend/full-stack engineer to implement our customer self-service portal. Must adhere to WCAG accessibility guidelines and integrate with our existing backend REST endpoints.',
      category: 'Web Development',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
      budget: 1850,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
      client: client1._id,
      status: 'open',
    });

    const project3 = await Project.create({
      title: 'E-Commerce Marketplace UI/UX Redesign and Component System',
      description: 'Complete visual and experiential overhaul of our multi-vendor marketplace frontend. Deliverables include design system tokens, responsive checkout flow, and product catalogue.',
      category: 'UI/UX Design',
      skills: ['Figma', 'UI/UX Design', 'React', 'Tailwind CSS'],
      budget: 2400,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      client: client2._id,
      status: 'open',
    });

    const project4 = await Project.create({
      title: 'Automated CI/CD Pipeline & Docker Containerization Setup',
      description: 'Setup production-grade Docker compose configurations, automated GitHub Actions workflow, and automated staging deployment scripts.',
      category: 'DevOps & Cloud',
      skills: ['Docker', 'AWS', 'DevOps & Cloud', 'CI/CD'],
      budget: 1500,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      client: client2._id,
      status: 'open',
    });

    console.log('[Seed]: Created 4 Sample Projects.');

    // 5. Create a sample application for testing
    const sampleApp = await Application.create({
      project: project1._id,
      freelancer: freelancer1._id,
      proposal: 'Hello Sarah! I have built several high-throughput analytics dashboards using React, Node.js, and MongoDB. I can deliver a modular architecture with clean code and tests. Looking forward to discussing details!',
      bidAmount: 3000,
      estimatedDays: 18,
      status: 'pending',
    });

    console.log('[Seed]: Created Sample Application for testing.');
    console.log('\n=== SEED SUMMARY ===');
    console.log('Admin:       admin@workflowai.com       / password123');
    console.log('Client:      client@workflowai.com      / password123');
    console.log('Freelancer:  freelancer@workflowai.com  / password123');
    console.log('====================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
