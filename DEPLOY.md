# Deployment Guide

## Overview
- Backend → Render (free)
- Frontend → Vercel (free)
- Database → Neon (already set up)

---

## Step 1 — Push to GitHub

You need a GitHub repo. Do this once:

```bash
# In the root "Job tracker" folder
git init
git add .
git commit -m "Initial commit"
```

Then go to github.com → New repository → name it "job-tracker"
Copy the repo URL and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/job-tracker.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy Backend to Render

1. Go to https://render.com and sign up / log in
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"** → select your GitHub repo
4. Fill in these settings:

   | Field | Value |
   |-------|-------|
   | Name | job-tracker-api |
   | Root Directory | `backend` |
   | Environment | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Plan | Free |

5. Click **"Advanced"** → **"Add Environment Variable"** and add ALL of these:

   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | DATABASE_URL | (your Neon connection string) |
   | JWT_SECRET | (any long random string, 64+ chars) |
   | JWT_REFRESH_SECRET | (another long random string) |
   | JWT_EXPIRES_IN | 7d |
   | JWT_REFRESH_EXPIRES_IN | 30d |
   | FRONTEND_URL | https://your-app.vercel.app (fill after Vercel deploy) |
   | EMAIL_HOST | smtp.gmail.com |
   | EMAIL_PORT | 587 |
   | EMAIL_USER | your Gmail address |
   | EMAIL_PASS | your Gmail App Password* |
   | EMAIL_FROM | Job Tracker <noreply@jobtracker.com> |
   | CLOUDINARY_CLOUD_NAME | (from cloudinary.com dashboard) |
   | CLOUDINARY_API_KEY | (from cloudinary.com dashboard) |
   | CLOUDINARY_API_SECRET | (from cloudinary.com dashboard) |
   | RATE_LIMIT_WINDOW_MS | 900000 |
   | RATE_LIMIT_MAX | 200 |

6. Click **"Create Web Service"**
7. Wait ~3 minutes for the build to finish
8. Your backend URL will be: `https://job-tracker-api.onrender.com`

> **Gmail App Password**: Go to myaccount.google.com → Security → 2-Step Verification → App passwords → Generate one for "Mail"

---

## Step 3 — Run Migrations on Neon

After Render deploys, you need to run migrations. Two options:

**Option A — From your local machine** (easiest):
```bash
cd backend
# Make sure your .env has the Neon DATABASE_URL
npm run db:migrate
npm run db:seed
```

**Option B — Render Shell**:
In Render dashboard → your service → "Shell" tab → run:
```bash
npm run db:migrate
npm run db:seed
```

---

## Step 4 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up / log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo
4. Fill in these settings:

   | Field | Value |
   |-------|-------|
   | Root Directory | `frontend` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

5. Click **"Environment Variables"** and add:

   | Key | Value |
   |-----|-------|
   | VITE_API_URL | https://job-tracker-api.onrender.com/api |
   | VITE_SOCKET_URL | https://job-tracker-api.onrender.com |

6. Click **"Deploy"**
7. Your frontend URL will be: `https://job-tracker-xxx.vercel.app`

---

## Step 5 — Update FRONTEND_URL on Render

1. Go back to Render → your service → **Environment**
2. Update `FRONTEND_URL` to your actual Vercel URL
3. Render will auto-redeploy

---

## Step 6 — Test It

Visit your Vercel URL and log in with:
- Admin: admin@jobtracker.com / Admin@123
- HR: hr@jobtracker.com / Hr@123456
- Applicant: applicant@jobtracker.com / App@123456

---

## Troubleshooting

**"Application error" on Render**
→ Check Render logs: Dashboard → your service → Logs tab

**CORS errors in browser**
→ Make sure FRONTEND_URL on Render exactly matches your Vercel URL (no trailing slash)

**Socket.IO not connecting**
→ Render free tier sleeps after 15 min inactivity. First request wakes it up (~30s delay).

**"Failed to fetch" on Vercel**
→ Double-check VITE_API_URL has `/api` at the end and no trailing slash

**Emails not sending**
→ Gmail requires an App Password (not your regular password). Enable 2FA first.
