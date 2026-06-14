# 🚀 DriveClone — Complete Setup Guide

> Local development → GitHub → Live deployment  
> Follow every step in order. Nothing is skipped.

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Get Accounts & API Keys](#2-get-accounts--api-keys)
3. [Project Setup in VS Code](#3-project-setup-in-vs-code)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Run Locally](#5-run-locally)
6. [Test the API](#6-test-the-api)
7. [Push to GitHub](#7-push-to-github)
8. [Deploy Backend → Render](#8-deploy-backend--render)
9. [Deploy Frontend → Vercel](#9-deploy-frontend--vercel)
10. [Connect Frontend to Deployed Backend](#10-connect-frontend-to-deployed-backend)
11. [Verify Deployment](#11-verify-deployment)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Install these tools before anything else.

### Node.js (v18 or higher)
```bash
# Check if installed
node --version     # Should show v18.x.x or higher
npm --version      # Should show 9.x or higher
```

**Install if missing:**
- Windows/Mac: https://nodejs.org → Download LTS version
- Or use nvm (recommended):
```bash
# Mac/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 18
nvm use 18

# Windows — install nvm-windows:
# https://github.com/coreybutler/nvm-windows/releases
nvm install 18.0.0
nvm use 18.0.0
```

### Git
```bash
git --version   # Should show git version 2.x
```
**Install if missing:** https://git-scm.com/downloads

### VS Code
Download: https://code.visualstudio.com

---

## 2. Get Accounts & API Keys

You need **3 free accounts**. Set them up before touching the code.

---

### 2A. MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/atlas
2. Click **"Try Free"** → sign up
3. Choose **"M0 Free"** cluster → select your nearest region
4. Click **"Create Deployment"**
5. In the popup:
   - **Username**: `driveclone_user`
   - **Password**: click **"Autogenerate"** → **copy and save this password**
   - Click **"Create Database User"**
6. Choose **"My Local Environment"** → Add IP `0.0.0.0/0` → **"Add Entry"**
7. Click **"Finish and Close"** → **"Go to Overview"**
8. Click **"Connect"** → **"Drivers"**
9. Copy the connection string. It looks like:
   ```
   mongodb+srv://driveclone_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
10. Replace `<password>` with the password you saved
11. Add the database name before `?`:
    ```
    mongodb+srv://driveclone_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/driveclone?retryWrites=true&w=majority
    ```
    **Save this full string — it's your MONGO_URI**

---

### 2B. Cloudinary (Image Storage)

1. Go to https://cloudinary.com → **"Sign Up For Free"**
2. Complete registration
3. Go to your **Dashboard** (home page after login)
4. You'll see three values — **save all three**:
   - **Cloud Name** (e.g. `dxyz1234abc`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcDEF-ghiJKL_mnopqr`)

---

### 2C. GitHub

1. Go to https://github.com → Sign up if needed
2. You'll create two repos later in Step 7

---

### 2D. Render (Backend Hosting — Free)

1. Go to https://render.com → Sign up with GitHub
2. Nothing to configure yet — we'll do it in Step 8

---

### 2E. Vercel (Frontend Hosting — Free)

1. Go to https://vercel.com → Sign up with GitHub
2. Nothing to configure yet — we'll do it in Step 9

---

## 3. Project Setup in VS Code

### Step 1 — Open the project

```bash
# If you downloaded the ZIP:
# 1. Unzip driveclone-fullstack-complete.zip
# 2. You'll get a folder called "driveclone"

# Open VS Code
code driveclone
```

Or in VS Code: **File → Open Folder** → select the `driveclone` folder

---

### Step 2 — Install recommended extensions

When VS Code opens, you'll see a popup:
> "Do you want to install the recommended extensions?"

Click **"Install All"**

If you don't see the popup:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Extensions: Show Recommended Extensions`
3. Install all of them

**Most important extensions:**
| Extension | Purpose |
|-----------|---------|
| Prettier | Auto-format code on save |
| ESLint | Catch JavaScript errors |
| Tailwind CSS IntelliSense | Autocomplete class names |
| ES7 React Snippets | React shortcuts |
| REST Client | Test API inside VS Code |
| GitLens | Enhanced Git view |
| MongoDB for VS Code | Browse your database |

---

### Step 3 — Verify folder structure

In the VS Code Explorer panel, you should see:
```
driveclone/
├── .vscode/           ← VS Code config (already set up)
├── backend/           ← Node.js + Express API
├── frontend/          ← React app
├── .gitignore
├── api-test.http      ← API testing file
├── mcp-claude-desktop-config.json
└── README.md
```

---

## 4. Configure Environment Variables

> ⚠️ This is the most important step. Wrong values here = nothing works.

### Backend `.env`

1. In VS Code Explorer, open `backend/` folder
2. Right-click → **"New File"** → name it `.env`
3. Paste this content and fill in YOUR values:

```env
# ─── Server ────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── MongoDB Atlas ─────────────────────────
# Paste your full connection string from Step 2A
MONGO_URI=mongodb+srv://driveclone_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/driveclone?retryWrites=true&w=majority

# ─── JWT ───────────────────────────────────
# Make this long and random — don't use the example below
JWT_SECRET=DriveClone_Super_Secret_2024_Change_This_In_Production_xyz789
JWT_EXPIRE=7d

# ─── Cloudinary ────────────────────────────
# From your Cloudinary dashboard (Step 2B)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# ─── CORS ──────────────────────────────────
CLIENT_URL=http://localhost:3000
```

**Save the file** (`Ctrl+S`)

---

### Frontend `.env`

1. Open `frontend/` folder
2. Right-click → **"New File"** → name it `.env`
3. Paste:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MCP_URL=http://localhost:5001
```

**Save the file** (`Ctrl+S`)

---

## 5. Run Locally

You need **two terminals** — one for backend, one for frontend.

### Open Terminal 1 — Backend

In VS Code: **Terminal → New Terminal** (or `` Ctrl+` ``)

```bash
# Navigate to backend
cd backend

# Install all dependencies (first time only, takes ~1 min)
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
[nodemon] starting `node server.js`
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000 in development mode
```

> ❌ If you see "MongoDB Error" → check your MONGO_URI in .env  
> ❌ If you see "EADDRINUSE" → port 5000 is busy, change PORT in .env to 5001

---

### Open Terminal 2 — Frontend

In VS Code: **Terminal → New Terminal** (or click the `+` icon in terminal panel)

```bash
# Navigate to frontend
cd frontend

# Install all dependencies (first time only, takes ~2-3 min)
npm install

# Start React development server
npm start
```

**Expected output:**
```
Compiled successfully!

Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

Your browser will open automatically at `http://localhost:3000`

---

### Quick Start (Both servers at once — Optional)

Using VS Code Tasks:
1. Press `Ctrl+Shift+P`
2. Type: `Tasks: Run Task`
3. Select: **🔥 Start Full Stack**

This opens both servers in split terminals automatically.

---

## 6. Test the API

### Option A — REST Client in VS Code (Recommended)

1. Open `api-test.http` in VS Code
2. Click **"Send Request"** above the **Register** block
3. You'll see the response on the right panel
4. Copy the `token` value from the response
5. Paste it at the top of the file where it says `@token = PASTE_YOUR_TOKEN_HERE`
6. Now test all other endpoints

---

### Option B — Postman

1. Download Postman: https://postman.com
2. Create a new Collection called "DriveClone"
3. Set base URL: `http://localhost:5000/api`

**Register:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Body → Raw → JSON:
```json
{
  "name": "Your Name",
  "email": "you@test.com",
  "password": "password123"
}
```

**Copy the token** from response → set as Bearer Token in collection Authorization.

---

### Option C — Browser (GET requests only)

Visit these URLs while backend is running:
- `http://localhost:5000/api/health` → Should say "DriveClone API is running"

---

## 7. Push to GitHub

You'll create **two separate repositories** — one for backend, one for frontend.

### Step 1 — Create GitHub repositories

Go to https://github.com → click the **`+`** icon → **"New repository"**

**Repo 1:**
- Name: `driveclone-backend`
- Visibility: Public (or Private)
- ❌ Do NOT add README, .gitignore, or license (we already have them)
- Click **"Create repository"**

**Repo 2:**
- Name: `driveclone-frontend`
- Same settings as above
- Click **"Create repository"**

---

### Step 2 — Push Backend

In VS Code Terminal 1 (backend):

```bash
# Make sure you're in the backend folder
cd backend

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "feat: initial DriveClone backend - MERN stack with JWT, Cloudinary, MCP"

# Add your GitHub repo as remote (REPLACE with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/driveclone-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Go to `https://github.com/YOUR_USERNAME/driveclone-backend`  
You should see all your backend files.

> ✅ The `.env` file will NOT be pushed (it's in .gitignore) — that's correct!

---

### Step 3 — Push Frontend

Open a new terminal or use Terminal 2:

```bash
# Make sure you're in the frontend folder
cd frontend

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "feat: initial DriveClone frontend - React + Redux + Tailwind"

# Add your GitHub repo as remote (REPLACE with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/driveclone-frontend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Go to `https://github.com/YOUR_USERNAME/driveclone-frontend`  
You should see all your frontend files.

---

## 8. Deploy Backend → Render

### Step 1 — Create a new Web Service

1. Go to https://render.com → Log in
2. Click **"New +"** → **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect GitHub"** → Authorize Render
5. Find `driveclone-backend` → click **"Connect"**

---

### Step 2 — Configure the service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `driveclone-api` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

---

### Step 3 — Add environment variables

Scroll down to **"Environment Variables"** section.  
Click **"Add Environment Variable"** for each one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | *(your full MongoDB Atlas URI)* |
| `JWT_SECRET` | *(your secret key)* |
| `JWT_EXPIRE` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | *(from Cloudinary dashboard)* |
| `CLOUDINARY_API_KEY` | *(from Cloudinary dashboard)* |
| `CLOUDINARY_API_SECRET` | *(from Cloudinary dashboard)* |
| `CLIENT_URL` | *(leave blank for now — add after Vercel deploy)* |

> ⚠️ Double-check MONGO_URI — it's the most common mistake.

---

### Step 4 — Deploy

Click **"Create Web Service"**

Render will:
1. Pull your code from GitHub
2. Run `npm install`
3. Start `node server.js`

Watch the logs. Wait for:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000 in production mode
```

This takes **2–5 minutes** on first deploy.

---

### Step 5 — Get your backend URL

Once deployed, Render shows your URL at the top:
```
https://driveclone-api.onrender.com
```

**Test it:** Open `https://driveclone-api.onrender.com/api/health` in your browser.  
Should see: `{"success":true,"message":"DriveClone API is running"}`

**Save this URL** — you need it for Step 10.

---

## 9. Deploy Frontend → Vercel

### Step 1 — Import project

1. Go to https://vercel.com → Log in with GitHub
2. Click **"Add New…"** → **"Project"**
3. Find `driveclone-frontend` → click **"Import"**

---

### Step 2 — Configure project

| Field | Value |
|-------|-------|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `./` (leave default) |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

---

### Step 3 — Add environment variable

Click **"Environment Variables"** → expand it → add:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://driveclone-api.onrender.com/api` |

> Replace `driveclone-api.onrender.com` with YOUR actual Render URL from Step 8.

---

### Step 4 — Deploy

Click **"Deploy"**

Vercel will build your React app. This takes **1–2 minutes**.

You'll see a preview URL like:
```
https://driveclone-frontend.vercel.app
```

---

## 10. Connect Frontend to Deployed Backend

### Update CORS on Render

Now that you have the Vercel URL, you need to tell the backend to allow it.

1. Go to Render dashboard → `driveclone-api` → **"Environment"**
2. Edit `CLIENT_URL`:
   - Value: `https://driveclone-frontend.vercel.app`
   - (Use YOUR actual Vercel URL)
3. Click **"Save Changes"**
4. Render will automatically redeploy (takes ~1 min)

---

### Update Vercel Environment Variable (if needed)

If you need to change the API URL later:

1. Vercel Dashboard → `driveclone-frontend` → **"Settings"** → **"Environment Variables"**
2. Edit `REACT_APP_API_URL`
3. Go to **"Deployments"** → **"Redeploy"** (required to pick up env var changes)

---

## 11. Verify Deployment

Test everything is working end-to-end:

### ✅ Checklist

```
□ Backend health: https://YOUR_RENDER_URL/api/health → returns JSON
□ Frontend loads: https://YOUR_VERCEL_URL → shows DriveClone login page
□ Register: Create a new account on the live site
□ Login: Sign in successfully
□ Create folder: Click "New Folder" — folder appears
□ Upload image: Go into a folder → Upload tab → drag an image
□ Image displays: Image card appears with thumbnail
□ Folder size: Badge on folder shows file size
□ Nested folder: Create folder inside folder — sidebar tree updates
□ Delete folder: Delete works, sidebar refreshes
□ Logout: Logout button works, redirects to login
□ Protected route: Visiting /dashboard without login → redirects to /login
```

---

### 🔄 Future Updates Workflow

After making code changes locally:

```bash
# Backend changes:
cd backend
git add .
git commit -m "fix: your change description"
git push origin main
# Render auto-deploys in ~2 min

# Frontend changes:
cd frontend
git add .
git commit -m "feat: your feature description"
git push origin main
# Vercel auto-deploys in ~1 min
```

---

## 12. Troubleshooting

### ❌ "Cannot connect to MongoDB"
- Check MONGO_URI format — must include `/driveclone?` before the `?`
- Make sure `0.0.0.0/0` is in MongoDB Atlas Network Access
- Check username/password has no special characters (use URL encoding if needed)

### ❌ "Invalid CORS" / API calls blocked
- Make sure `CLIENT_URL` in Render env vars matches EXACTLY your Vercel URL
- No trailing slash: `https://xxx.vercel.app` ✅ not `https://xxx.vercel.app/` ❌

### ❌ "Cloudinary upload fails"
- Verify all 3 Cloudinary env vars are set (Cloud Name, API Key, API Secret)
- Check Cloudinary dashboard — make sure account is active

### ❌ React app shows blank page on Vercel
- Check browser DevTools Console for errors
- Make sure `REACT_APP_API_URL` is set in Vercel env vars
- Redeploy after adding env vars (Vercel requires rebuild)

### ❌ Backend works but token not sent
- Open browser DevTools → Network tab → check request headers
- `Authorization: Bearer <token>` should appear on all API calls

### ❌ Render backend keeps sleeping (free tier)
Free Render services sleep after 15 min of inactivity.
- Option 1: Use a free uptime monitor like https://uptimerobot.com to ping every 5 min
- Option 2: Upgrade to Render Starter ($7/mo)

### ❌ Port already in use (local)
```bash
# Find what's using port 5000
lsof -i :5000          # Mac/Linux
netstat -ano | findstr :5000   # Windows

# Kill it:
kill -9 <PID>          # Mac/Linux
taskkill /PID <PID> /F # Windows
```

### ❌ `npm install` fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Final Project Architecture

```
LOCAL DEVELOPMENT:
  http://localhost:3000  (React frontend)
         ↓ Axios calls
  http://localhost:5000  (Express backend)
         ↓ Mongoose
  MongoDB Atlas          (cloud database)
         ↓ Cloudinary SDK
  Cloudinary CDN         (image storage)

PRODUCTION:
  https://xxx.vercel.app     (React → Vercel)
         ↓ HTTPS
  https://xxx.onrender.com   (Express → Render)
         ↓
  MongoDB Atlas + Cloudinary (same services)
```

---

## 🎤 Interview-Ready Summary

> "I built a full-stack MERN application. The frontend is React with Redux Toolkit for state management, deployed on Vercel. The backend is Node.js/Express with JWT authentication and Multer+Cloudinary for image uploads, deployed on Render. The database is MongoDB Atlas. I implemented recursive folder size calculation using a BFS algorithm, a materialized path pattern for the folder hierarchy, and an MCP-compatible server so AI agents like Claude can interact with the API using natural language."

---

*Built with ❤️ using React · Redux · Node.js · Express · MongoDB · Cloudinary · Tailwind CSS*
