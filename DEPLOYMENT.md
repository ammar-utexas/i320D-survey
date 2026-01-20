# SurveyFlow Deployment Guide

This guide walks you through deploying SurveyFlow using **Vercel** (frontend) and **Railway** (backend + PostgreSQL).

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Vercel            │     │   Railway           │     │   Railway           │
│   (Frontend)        │────▶│   (Backend)         │────▶│   (PostgreSQL)      │
│   surveyflow.vercel │     │   api.railway.app   │     │   Internal DB       │
│   .app              │     │                     │     │                     │
└─────────────────────┘     └──────────┬──────────┘     └─────────────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │   GitHub OAuth      │
                            │   (Authentication)  │
                            └─────────────────────┘
```

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account (for OAuth and repository)
- [ ] Node.js 18+ installed locally
- [ ] Python 3.11+ installed locally
- [ ] Git installed and configured

## Table of Contents

1. [Step 1: Create GitHub OAuth App](#step-1-create-github-oauth-app)
2. [Step 2: Set Up Railway Account](#step-2-set-up-railway-account)
3. [Step 3: Deploy PostgreSQL on Railway](#step-3-deploy-postgresql-on-railway)
4. [Step 4: Deploy Backend on Railway](#step-4-deploy-backend-on-railway)
5. [Step 5: Set Up Vercel Account](#step-5-set-up-vercel-account)
6. [Step 6: Deploy Frontend on Vercel](#step-6-deploy-frontend-on-vercel)
7. [Step 7: Update GitHub OAuth Callback URL](#step-7-update-github-oauth-callback-url)
8. [Step 8: Verify Deployment](#step-8-verify-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Step 1: Create GitHub OAuth App

The GitHub OAuth App handles user authentication.

### 1.1 Navigate to GitHub Developer Settings

1. Go to [github.com](https://github.com) and sign in
2. Click your profile picture → **Settings**
3. Scroll down to **Developer settings** (left sidebar, bottom)
4. Click **OAuth Apps** → **New OAuth App**

### 1.2 Register the OAuth App

Fill in the following (use placeholder URLs for now - we'll update them later):

| Field | Value |
|-------|-------|
| **Application name** | `SurveyFlow` (or your preferred name) |
| **Homepage URL** | `https://example.com` (placeholder) |
| **Application description** | Optional: "Survey platform for educators" |
| **Authorization callback URL** | `https://example.com/api/v1/auth/github/callback` (placeholder) |

Click **Register application**.

### 1.3 Generate Client Secret

1. On the app page, click **Generate a new client secret**
2. **IMPORTANT:** Copy and save both values securely:
   - `Client ID`: `Ov23li...` (visible on page)
   - `Client Secret`: `abc123...` (shown only once!)

> ⚠️ **Keep these secret!** Never commit them to git or share publicly.

---

## Step 2: Set Up Railway Account

### 2.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Login** → **Login with GitHub**
3. Authorize Railway to access your GitHub account
4. Complete any verification steps if prompted

### 2.2 Verify Account (Optional but Recommended)

For higher usage limits:
1. Go to **Account Settings** → **Billing**
2. Add a payment method (you won't be charged unless you exceed free tier)
3. This increases your monthly limit from $5 to $10 free credits

---

## Step 3: Deploy PostgreSQL on Railway

### 3.1 Create New Project

1. On Railway dashboard, click **New Project**
2. Select **Deploy PostgreSQL** (or **Provision PostgreSQL**)
3. Wait for the database to deploy (usually < 30 seconds)

### 3.2 Get Database Connection String

1. Click on the PostgreSQL service in your project
2. Go to **Variables** tab
3. Find `DATABASE_URL` - it looks like:
   ```
   postgresql://postgres:password@host.railway.internal:5432/railway
   ```
4. **Copy this value** - you'll need it for the backend

### 3.3 Note the Internal vs External URLs

Railway provides two database URLs:
- **Internal** (`*.railway.internal`): Use for services within Railway (faster)
- **External** (`*.proxy.rlwy.net`): Use for local development or external access

For the backend on Railway, use the **internal** URL.

---

## Step 4: Deploy Backend on Railway

### 4.1 Add Backend Service

1. In the same Railway project, click **New** → **GitHub Repo**
2. Select your repository: `ammar-utexas/i320D-survey`
3. Railway will detect the repo - click **Deploy**

### 4.2 Configure Root Directory

Since the backend is in a subdirectory:

1. Click on the new service
2. Go to **Settings** tab
3. Under **Source**, set:
   - **Root Directory**: `backend`
4. Click **Apply**

### 4.3 Set Environment Variables

1. Go to **Variables** tab
2. Click **New Variable** for each of the following:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:...` | Copy from PostgreSQL service, **change `postgresql://` to `postgresql+asyncpg://`** |
| `GITHUB_CLIENT_ID` | `Ov23li...` | From Step 1.3 |
| `GITHUB_CLIENT_SECRET` | `abc123...` | From Step 1.3 |
| `GITHUB_CALLBACK_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1/auth/github/callback` | Update after getting domain |
| `JWT_SECRET` | (generate random string) | See below |
| `JWT_EXPIRY_HOURS` | `24` | |
| `JWT_COOKIE_NAME` | `surveyflow_token` | |
| `FRONTEND_URL` | `https://YOUR-FRONTEND.vercel.app` | Update after Vercel deploy |

**Generate JWT_SECRET:**
```bash
# Run this in terminal to generate a secure secret:
openssl rand -hex 32
```
Or use: `python -c "import secrets; print(secrets.token_hex(32))"`

### 4.4 Get Backend Domain

1. Go to **Settings** tab
2. Under **Networking** → **Public Networking**, click **Generate Domain**
3. Railway will generate a URL like: `surveyflow-backend-production.up.railway.app`
4. **Copy this URL** - you'll need it for:
   - `GITHUB_CALLBACK_URL` (update the variable)
   - Frontend configuration
   - GitHub OAuth App settings

### 4.5 Update GITHUB_CALLBACK_URL

Go back to **Variables** and update:
```
GITHUB_CALLBACK_URL=https://YOUR-ACTUAL-BACKEND.up.railway.app/api/v1/auth/github/callback
```

### 4.6 Verify Backend Deployment

1. Railway will automatically redeploy when you update variables
2. Wait for deployment to complete (check **Deployments** tab)
3. Visit: `https://YOUR-BACKEND.up.railway.app/api/v1/health`
4. You should see: `{"status": "healthy"}`

---

## Step 5: Set Up Vercel Account

### 5.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access your GitHub repositories

### 5.2 Install Vercel for GitHub

If prompted, install the Vercel GitHub App:
1. Select **All repositories** or choose specific ones
2. Click **Install**

---

## Step 6: Deploy Frontend on Vercel

### 6.1 Import Project

1. On Vercel dashboard, click **Add New...** → **Project**
2. Find and select: `ammar-utexas/i320D-survey`
3. Click **Import**

### 6.2 Configure Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` (click **Edit** to change) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |
| **Install Command** | `npm install` (default) |

### 6.3 Set Environment Variables

Under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1` |

> Note: Replace `YOUR-BACKEND` with your actual Railway backend URL.

### 6.4 Deploy

1. Click **Deploy**
2. Wait for the build to complete (usually 1-2 minutes)
3. Vercel will provide a URL like: `surveyflow.vercel.app`

### 6.5 Copy Frontend URL

Note your Vercel URL - you need it for:
- Railway `FRONTEND_URL` variable
- GitHub OAuth App settings

---

## Step 7: Update GitHub OAuth Callback URL

Now that you have both URLs, update the GitHub OAuth App:

### 7.1 Update OAuth App Settings

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click on your **SurveyFlow** app
3. Update:

| Field | New Value |
|-------|-----------|
| **Homepage URL** | `https://YOUR-FRONTEND.vercel.app` |
| **Authorization callback URL** | `https://YOUR-BACKEND.up.railway.app/api/v1/auth/github/callback` |

4. Click **Update application**

### 7.2 Update Railway FRONTEND_URL

1. Go to Railway → Your project → Backend service → **Variables**
2. Update: `FRONTEND_URL=https://YOUR-FRONTEND.vercel.app`
3. Railway will redeploy automatically

---

## Step 8: Verify Deployment

### 8.1 Test Health Check

```bash
curl https://YOUR-BACKEND.up.railway.app/api/v1/health
# Should return: {"status":"healthy"}
```

### 8.2 Test Frontend

1. Visit: `https://YOUR-FRONTEND.vercel.app`
2. You should see the SurveyFlow login page

### 8.3 Test OAuth Flow

1. Click **Sign in with GitHub**
2. You should be redirected to GitHub
3. Authorize the app
4. You should be redirected back to the frontend, logged in
5. Your avatar and username should appear

### 8.4 Test Full Flow (After Backend Stage 2+)

1. Navigate to a survey: `https://YOUR-FRONTEND.vercel.app/s/test-survey`
2. Fill out and submit responses
3. Verify responses are saved

---

## Environment Variables Summary

### Railway (Backend)

```env
DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@HOST.railway.internal:5432/railway
GITHUB_CLIENT_ID=Ov23liXXXXXXXXXXXXXX
GITHUB_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GITHUB_CALLBACK_URL=https://YOUR-BACKEND.up.railway.app/api/v1/auth/github/callback
JWT_SECRET=your-64-character-random-hex-string
JWT_EXPIRY_HOURS=24
JWT_COOKIE_NAME=surveyflow_token
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
```

### Vercel (Frontend)

```env
VITE_API_URL=https://YOUR-BACKEND.up.railway.app/api/v1
```

---

## Troubleshooting

### Backend won't start

**Check logs:**
1. Railway → Backend service → **Deployments** → Click latest → **View Logs**

**Common issues:**
- `DATABASE_URL` wrong format (needs `postgresql+asyncpg://`)
- Missing environment variables
- Dockerfile not found (check Root Directory is `backend`)

### OAuth redirect fails

**"Redirect URI mismatch" error:**
- Verify `GITHUB_CALLBACK_URL` exactly matches the OAuth App's callback URL
- Include `/api/v1/auth/github/callback` path

**Cookie not set after login:**
- Check `FRONTEND_URL` is correct (no trailing slash)
- Verify both domains use HTTPS

### CORS errors

**"Access-Control-Allow-Origin" errors:**
- Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
- No trailing slash
- Protocol must match (both HTTPS)

### Database connection fails

**"Connection refused" errors:**
- Use internal Railway URL (`*.railway.internal`) for Railway-hosted backend
- Verify `postgresql+asyncpg://` prefix (not just `postgresql://`)

### Frontend can't reach backend

**Network errors:**
- Verify `VITE_API_URL` is set correctly in Vercel
- Ensure backend is running (check health endpoint)
- Check for typos in URL

---

## Local Development with Deployed Services

You can develop locally while using deployed database:

### Backend Local + Railway DB

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env with EXTERNAL Railway database URL:
# DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@HOST.proxy.rlwy.net:PORT/railway
# (Use the public/external URL, not internal)

uvicorn app.main:app --reload --port 8000
```

### Frontend Local + Deployed Backend

```bash
cd frontend
npm install

# Create .env.local:
# VITE_API_URL=https://YOUR-BACKEND.up.railway.app/api/v1

npm run dev
```

---

## Cost Estimates

### Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Railway** | $5/month credits (or $10 with verification) |
| **Vercel** | Generous free tier for hobby projects |
| **GitHub OAuth** | Free |

### Expected Usage

For a class of ~100 students:
- Railway: Well within free tier
- Vercel: Well within free tier
- Database storage: < 100MB

---

## Next Steps After Deployment

1. **Create a test survey** - Upload a JSON config via admin dashboard
2. **Share the survey URL** - `https://YOUR-FRONTEND.vercel.app/s/your-survey-slug`
3. **Monitor responses** - Check admin dashboard for completions
4. **Export data** - Download CSV/JSON when ready

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Frontend | `https://YOUR-FRONTEND.vercel.app` |
| Backend API | `https://YOUR-BACKEND.up.railway.app/api/v1` |
| API Docs | `https://YOUR-BACKEND.up.railway.app/docs` |
| Health Check | `https://YOUR-BACKEND.up.railway.app/api/v1/health` |
| Railway Dashboard | `https://railway.app/dashboard` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| GitHub OAuth Settings | `https://github.com/settings/developers` |
