# 🎯 Job Application Tracker System

A full-stack job application tracking system with multi-role authentication, real-time notifications, and comprehensive analytics.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Styled Components, Framer Motion, Recharts |
| Backend | Node.js + Express, Socket.IO |
| Database | PostgreSQL on **Neon** (free) |
| File Storage | Cloudinary (free tier) |
| Deployment | **Vercel** (frontend) + **Render** (backend) |

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Applicant** | Browse jobs, submit applications, track status |
| **HR Staff** | Post jobs, manage applications, update statuses, view reports |
| **Committee Member** | Review applications, submit evaluations |
| **Admin** | Full access: user management, audit logs, all features |

## 🔧 Local Setup

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free)
- A [Cloudinary](https://cloudinary.com) account (free)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL and VITE_SOCKET_URL
npm run dev
```

## 🌐 Deployment

### 1. Neon Database
1. Go to [neon.tech](https://neon.tech) → Create account → New project
2. Copy the connection string
3. Run migrations: `npm run db:migrate` (with DATABASE_URL set)

### 2. Render (Backend)
1. Push backend to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root directory to `backend`
4. Build: `npm install` | Start: `npm start`
5. Add all environment variables from `.env.example`

### 3. Vercel (Frontend)
1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, set root directory to `frontend`
4. Add env vars: `VITE_API_URL` (your Render URL + `/api`), `VITE_SOCKET_URL` (your Render URL)
5. Deploy!

## 🔑 Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jobtracker.com | Admin@123 |
| HR Staff | hr@jobtracker.com | Hr@123456 |
| Committee | committee@jobtracker.com | App@123456 |
| Applicant | applicant@jobtracker.com | App@123456 |

## ✨ Features

- 🔐 JWT auth with refresh tokens + email verification
- 👥 4 user roles with RBAC
- 💼 Job vacancy management with rich details
- 📋 Application submission with CV upload
- ⭐ Committee evaluation system with scoring
- 🔔 Real-time notifications via Socket.IO
- 📊 Analytics dashboard with charts
- 📥 Export reports as CSV/JSON
- 🌙 Dark/Light theme toggle
- 🔍 Audit logging for all actions
- 📱 Fully responsive design
