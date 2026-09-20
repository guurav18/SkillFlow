# WorkFlow AI — "AI-powered Freelancer & Project Management Platform"

> **Phase 1: Authentication & Core Marketplace Foundation**

WorkFlow AI is a production-grade full-stack platform connecting high-caliber talent with innovative clients.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide React, Axios, Vite
- **Backend**: Node.js, Express.js REST APIs, MongoDB, Mongoose, JWT, bcryptjs
- **Database**: MongoDB (Mongoose ODM)

---

## 👥 Platform Roles & Permissions

| Role | Permissions & Flows |
|---|---|
| **Client** | Create & manage projects, browse incoming proposals, view developer credentials, hire freelancers with 1-click |
| **Freelancer** | Discover open projects with real-time search & filters, submit customized bids/proposals, monitor application statuses, manage active contracts |
| **Admin** | Platform metrics hub (total users, clients, freelancers, open/assigned scopes, recent activities) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/workflow_ai` or MongoDB Atlas URI)

### 1. Start Backend Server

```bash
cd backend
npm install
npm run seed     # Seeds Admin, Clients, Freelancers, and Sample Projects
npm start        # Launches server on http://localhost:5000
```

### 2. Start Frontend Dev Server

```bash
cd frontend
npm install
npm run dev      # Launches Vite frontend on http://localhost:5173
```

---

## 🔑 Pre-Seeded Development Accounts

All test accounts use password: `password123`

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@workflowai.com` | `password123` |
| **Client** | `client@workflowai.com` | `password123` |
| **Freelancer** | `freelancer@workflowai.com` | `password123` |

---

## 🛣️ Phase Roadmap

- ✅ **PHASE 1 (Current)**: Authentication, Role-based Dashboards, Project Creation, Discovery, Application System & Hiring Engine.
- ⏳ **PHASE 2**: Project Workspace (Tasks, Kanban Board, Milestones, Real-time Chat).
- ⏳ **PHASE 3**: Business Layer (Payments, Invoices, Notifications, Analytics).
- ⏳ **PHASE 4**: AI Layer (AI Requirement Breakdown, Freelancer Matching, Effort Estimation, AI Copilot).
- ⏳ **PHASE 5**: Production Engineering (Docker, CI/CD, Production Deployment).
