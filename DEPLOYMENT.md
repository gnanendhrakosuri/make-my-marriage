# Deployment Guide: Vercel (Frontend) + Render / Railway (Backend)

This document provides exact, step-by-step instructions for deploying Make My Marriage.

---

## Architecture at a Glance

- **Frontend**: Next.js 15 (App Router) deployed on **Vercel**.
- **Backend**: FastAPI (Python 3.12) deployed as a Web Service on **Render** (or **Railway**).
- **Database**: **MongoDB Atlas** (Cloud).
- **Email Delivery**: **Resend**.

---

## Step 1: Deploy the Backend (Render)

### A. Deploy via GitHub Repository
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your Git repository (`make-my-marriage`).
3. Fill in the service configuration:
   - **Name**: `make-my-marriage-backend`
   - **Region**: Select the region nearest to your MongoDB Atlas cluster (e.g., Frankfurt, Oregon, Singapore).
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free or Starter

### B. Configure Backend Environment Variables
Under the **Environment Variables** tab in Render, configure the following:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.12.0` | Ensures Python 3.12 runtime |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority` | Your Atlas connection string |
| `DATABASE_NAME` | `make-my-marriage-prod` | Target production database |
| `SECRET_KEY` | *(A long random 64-character string)* | Session token cryptographic secret |
| `CORS_ORIGINS` | `https://your-frontend-app.vercel.app` | Vercel domain (temporarily `*` or update after Step 2) |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` | Base URL used for invitation links |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | Resend API key |
| `EMAIL_FROM` | `"Make My Marriage <onboarding@resend.dev>"` | Verified sender address or sandbox |

### C. Verify Backend Deployment
Once deployed, copy your backend URL (e.g. `https://make-my-marriage-backend.onrender.com`).
Verify by visiting:
```
https://<your-backend-url>/api/v1/health
```
It should return:
```json
{"status": "ok"}
```

---

## Step 2: Deploy the Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** > **Project**.
2. Import the `make-my-marriage` Git repository.
3. In the project configuration:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Click *Edit* and select **`frontend`**
4. Expand **Environment Variables** and add:
   - **`NEXT_PUBLIC_API_BASE_URL`**: `https://<your-backend-url>` (the Render URL from Step 1, without a trailing slash)
5. Click **Deploy**.

---

## Step 3: Connect Frontend & Backend (Final Handshake)

1. Copy your assigned Vercel URL (e.g., `https://make-my-marriage.vercel.app`).
2. Go back to your **Render Dashboard** > `make-my-marriage-backend` > **Environment**.
3. Update the two variables with your real Vercel URL:
   - `CORS_ORIGINS` = `https://make-my-marriage.vercel.app`
   - `FRONTEND_URL` = `https://make-my-marriage.vercel.app`
4. Click **Save Changes** (Render will automatically re-deploy the backend with the new allowed origin).

---

## Step 4: MongoDB Atlas IP Whitelist (Important)

In your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/):
1. Navigate to **Network Access**.
2. If your hosting provider (Render free tier) uses dynamic IPs, add `0.0.0.0/0` (Allow Access from Anywhere) with a comment like `Render Web Service`.
3. Ensure your database user has read/write privileges on the database specified in `DATABASE_NAME`.

