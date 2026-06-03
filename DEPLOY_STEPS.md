# 🚀 NearJob — Full Deployment Guide (100% Free)

## Files already added to your repo:
- `render.yaml` — Render backend config
- `nearjob/vercel.json` — Vercel frontend config + security headers
- `backend/.env.example` — Safe env variable template

---

## Step 1 — Push to GitHub

1. Go to https://github.com/new
2. Name it: nearjowb → Keep it Private → Create repository
3. Run in terminal:
   git remote add origin https://github.com/YOUR_USERNAME/nearjowb.git
   git branch -M main
   git push -u origin main

---

## Step 2 — Free MySQL Database (Aiven.io)

1. Go to https://aiven.io → Sign up with GitHub
2. Create Service → MySQL → Free plan → Create
3. From Connection Info tab, copy: Host, User, Password
4. In the Query Runner, run:
   CREATE DATABASE nearjob CHARACTER SET utf8mb4;

---

## Step 3 — Deploy Backend on Render

1. Go to https://render.com → Sign up with GitHub
2. New+ → Web Service → Connect nearjowb repo
3. Settings:
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: node server.js
   - Instance: Free
4. Environment Variables:
   NODE_ENV=production
   PORT=10000
   DB_HOST=(from Aiven)
   DB_USER=(from Aiven)
   DB_PASSWORD=(from Aiven)
   DB_NAME=nearjob
   JWT_SECRET=(run: openssl rand -hex 64)
   AI_API_KEY=(your key)
   ALLOWED_ORIGINS=(fill after step 4)
5. Create Web Service → wait for deploy
   → Your URL: https://nearjob-backend.onrender.com

---

## Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com/new → Import GitHub repo
2. Root Directory: nearjob
3. Framework: Create React App (auto-detected)
4. Environment Variable:
   REACT_APP_API_URL=https://nearjob-backend.onrender.com
5. Deploy
   → Your URL: https://nearjob-XXXXX.vercel.app

---

## Step 5 — Fix CORS

Go back to Render → Environment → Set:
  ALLOWED_ORIGINS=https://nearjob-XXXXX.vercel.app
Save → redeploy → Done!

---

## Security Already Configured:
- .env excluded from GitHub
- CORS whitelist
- Helmet security headers
- Rate limiting
- JWT auth
- Vercel security headers (XSS, clickjacking protection)
- HTTPS automatic on both platforms
