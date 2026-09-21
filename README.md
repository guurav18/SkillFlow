# ✦ SkillFlow

### Find Talent. Build Anything.

SkillFlow is a full-stack freelance marketplace and project management platform that connects clients with skilled freelancers and provides an intelligent workspace to manage projects from requirements to delivery.

Instead of being only a freelancer marketplace, SkillFlow combines:

**Talent Discovery + Hiring + Project Management + Collaboration + AI Intelligence**

---

## 🚀 Overview

Finding the right freelancer is only the beginning.

Once a freelancer is hired, projects still require:

- Task management
- Milestone tracking
- Client approvals
- Real-time communication
- Project monitoring
- Invoicing
- Notifications
- Progress tracking

SkillFlow brings these workflows into one platform.

AI works as an intelligent layer across the platform to help with:

- Project requirement breakdown
- Freelancer matching
- Task effort estimation
- Project health analysis
- Project assistance through AI Copilot

---

## ✨ Key Features

### 👤 Multi-Role Platform

SkillFlow supports three major roles:

#### Client
- Register / Login
- Create projects
- Define budget and deadline
- Browse freelancer profiles
- Review applications
- Hire freelancers
- Manage project workspace
- Review submitted tasks
- Approve or request changes
- Track milestones
- Chat with freelancers
- View analytics
- Manage invoices and notifications

#### Freelancer
- Register / Login
- Create professional profile
- Add skills and portfolio
- Browse projects
- Search and discover opportunities
- Apply to projects
- Track applications
- Manage hired projects
- Work through Kanban tasks
- Submit tasks for review
- Respond to client change requests
- Track milestones
- Chat with clients
- View earnings and analytics

#### Admin
- Admin dashboard
- User management
- Project monitoring
- Transaction monitoring
- Platform analytics
- Reports

---

# 🤖 AI-Powered Features

SkillFlow uses AI as an intelligent layer over the core marketplace and project management system.

## 1. AI Requirement Breakdown

Convert project requirements into a structured development plan.

The AI can generate:

- Project summary
- Required skills
- Milestones
- Tasks
- Task priorities
- Task dependencies
- Estimated effort

### Flow

```text
Project Requirement
        ↓
   AI Analysis
        ↓
Milestones + Tasks
        ↓
Structured Project Plan
```

---

## 🏗️ Production Architecture & Deployment (Phase 5)

SkillFlow is designed for production deployment across separated frontend and backend services.

### Environment Variables

**Backend (`.env`)**
- `PORT`: Server port (default 5000)
- `NODE_ENV`: `development` or `production`
- `MONGO_URI` / `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRE`: Token expiration (e.g. `30d`)
- `AI_PROVIDER`: `gemini` or `mock`
- `AI_API_KEY`: API key for Gemini API
- `CLIENT_URL` / `FRONTEND_URL`: Allowed CORS origin for production

**Frontend (`.env`)**
- `VITE_API_URL`: Backend API URL (e.g., `https://api.workflowai.com`)

### Docker Setup

The backend can be containerized using Docker. A `Dockerfile` and `docker-compose.yml` are provided.

**Build and Run with Docker Compose:**
```bash
docker-compose up -d --build
```

**Manual Build:**
```bash
cd backend
docker build -t workflow-ai-backend .
docker run -p 5000:5000 --env-file .env workflow-ai-backend
```

### Vercel SPA Routing

The frontend is an SPA built with React and Vite. When deploying to Vercel, direct navigation to deep links (e.g. `/freelancer/browse`) requires routing fallback. This is handled automatically by the included `vercel.json` config which rewrites all requests to `/index.html`.

### Security Guidelines

- Real-time features (Socket.io) strictly validate workspace membership (`assignedFreelancers` and `hiredFreelancer`).
- Strict CORS validation replaces wildcard access in production environments.
- High demand API errors from Gemini (`503 Service Unavailable`) are handled gracefully via Circuit Breaker to prevent cascading failures.
