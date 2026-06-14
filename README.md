# 🗂️ DriveClone — Google Drive-like File Manager

A production-grade **MERN stack** application for cloud-based folder and image management, built with React + Redux Toolkit, Node.js + Express, MongoDB, JWT auth, Cloudinary uploads, and an MCP server for AI agent integration.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                           │
│  Redux Toolkit  ·  React Router  ·  Axios  ·  Tailwind CSS      │
└─────────────────────────┬────────────────────────────────────────┘
                          │ HTTPS / REST API
┌─────────────────────────▼────────────────────────────────────────┐
│                     BACKEND (Express)                            │
│  Auth · Folders · Images · JWT Middleware · Multer/Cloudinary    │
└────────────┬──────────────────────────────┬───────────────────────┘
             │                              │
    ┌────────▼────────┐          ┌──────────▼──────────┐
    │  MongoDB Atlas  │          │  Cloudinary CDN      │
    │  (Mongoose ODM) │          │  (Image storage)     │
    └─────────────────┘          └─────────────────────┘
             │
    ┌────────▼────────┐
    │  MCP Server     │  ← AI Agents / Claude Desktop
    │  (Port 5001)    │
    └─────────────────┘
```

---

## 📁 Complete Folder Structure

```
driveclone/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js    # register, login, getMe
│   │   ├── folderController.js  # CRUD + size + tree
│   │   └── imageController.js   # upload, list, delete
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT protect middleware
│   │   ├── errorMiddleware.js   # global error handler
│   │   └── validators.js        # express-validator rules
│   ├── models/
│   │   ├── User.js              # User schema (bcrypt)
│   │   ├── Folder.js            # Folder schema (nested)
│   │   └── Image.js             # Image schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── folderRoutes.js
│   │   └── imageRoutes.js
│   ├── services/
│   │   └── folderService.js     # Recursive size, tree, breadcrumb
│   ├── utils/
│   │   └── generateToken.js     # JWT generator
│   ├── mcp/
│   │   └── mcpServer.js         # MCP-compatible AI agent server
│   ├── server.js                # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── common/
    │   │   │   ├── Modal.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── Skeleton.jsx
    │   │   ├── folders/
    │   │   │   ├── FolderCard.jsx
    │   │   │   └── CreateFolderModal.jsx
    │   │   ├── images/
    │   │   │   ├── ImageCard.jsx    # with lightbox
    │   │   │   └── ImageUploader.jsx # drag-and-drop
    │   │   └── layout/
    │   │       ├── AppLayout.jsx
    │   │       ├── Sidebar.jsx      # recursive tree
    │   │       └── Breadcrumb.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── FolderPage.jsx
    │   │   └── AllImagesPage.jsx
    │   ├── services/
    │   │   ├── api.js             # Axios + JWT interceptor
    │   │   ├── authService.js
    │   │   ├── folderService.js
    │   │   └── imageService.js
    │   ├── store/
    │   │   ├── index.js           # Redux store
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       ├── folderSlice.js
    │   │       └── imageSlice.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx                # Router + Provider
    │   ├── index.js
    │   └── index.css              # Tailwind + custom classes
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in your .env values (see Environment Variables section)

npm install
npm run dev   # Starts on http://localhost:5000
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api

npm install
npm start     # Starts on http://localhost:3000
```

### 3. (Optional) Start MCP Server

```bash
cd backend
npm run mcp   # Starts on http://localhost:5001
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/driveclone

JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MCP_URL=http://localhost:5001
```

---

## 📡 API Reference

### Auth

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Register user |
| POST | `/api/auth/login` | `{email, password}` | Login → JWT |
| GET | `/api/auth/me` | — | Get current user |

### Folders (all protected)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/folders?parentFolder=<id>` | Get folders at level |
| GET | `/api/folders/tree` | Full nested tree |
| GET | `/api/folders/:id` | Folder + breadcrumb |
| GET | `/api/folders/:id/size` | Recursive size |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/:id` | Rename/recolor |
| DELETE | `/api/folders/:id` | Delete recursively |

### Images (all protected)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/images/upload/:folderId` | Upload (multipart) |
| GET | `/api/images/folder/:folderId` | Images in folder |
| GET | `/api/images` | All user images |
| DELETE | `/api/images/:id` | Delete from DB + Cloudinary |

---

## 🔄 Recursive Folder Size — How It Works

```
folderA/         ← 0 bytes direct
  image1.jpg     ← 500KB
  folderB/       ← nested
    image2.jpg   ← 1MB
    folderC/     ← deeply nested
      image3.jpg ← 200KB

calculateFolderSize("folderA") → 1.7MB
```

Uses **BFS (Breadth-First Search)** to avoid stack overflow on deep nesting:

```js
const queue = [folderId];
while (queue.length > 0) {
  const current = queue.shift();
  // sum images in current
  // enqueue all child folders
}
```

---

## 🤖 MCP Server (AI Agent Integration)

The MCP server at port 5001 exposes tools that AI agents (Claude Desktop, LLM pipelines) can call:

### Tools Available

| Tool | Description |
|------|-------------|
| `create_folder` | Create a folder (optionally nested) |
| `list_folders` | List folders for a user |
| `get_folder_size` | Get recursive folder size |
| `list_images` | List images in a folder |

### Example: Claude Desktop Config

```json
{
  "mcpServers": {
    "driveclone": {
      "command": "node",
      "args": ["path/to/backend/mcp/mcpServer.js"],
      "env": {
        "MONGO_URI": "your_mongo_uri",
        "PORT": "5001"
      }
    }
  }
}
```

### Example: Call via HTTP

```bash
curl -X POST http://localhost:5001/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_folder",
    "input": {
      "name": "Campaigns",
      "parentFolderId": "<Projects folder ID>",
      "ownerId": "<user _id>"
    }
  }'
```

---

## 🚢 Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add all environment variables from `.env`
6. Deploy → get your backend URL (e.g. `https://driveclone-api.onrender.com`)

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set environment variable:
   - `REACT_APP_API_URL` = `https://driveclone-api.onrender.com/api`
4. Deploy → done!

### Database → MongoDB Atlas

1. Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user
3. Whitelist `0.0.0.0/0` in Network Access (or Render's IP)
4. Copy the connection string to `MONGO_URI`

---

## 🧪 API Testing (Postman / curl)

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul","email":"rahul@test.com","password":"password123"}'

# 2. Login → copy the token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@test.com","password":"password123"}'

# 3. Create root folder
curl -X POST http://localhost:5000/api/folders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Projects","color":"#8B5CF6"}'

# 4. Create nested folder
curl -X POST http://localhost:5000/api/folders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Campaigns","parentFolder":"<FOLDER_ID>"}'

# 5. Upload image
curl -X POST http://localhost:5000/api/images/upload/<FOLDER_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@/path/to/photo.jpg"

# 6. Get recursive folder size
curl http://localhost:5000/api/folders/<FOLDER_ID>/size \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🎤 Interview Explanation

**Q: How does nested folder structure work?**
> Folders have a `parentFolder` field (null = root). Each folder also stores a materialized `path` string (e.g. `/rootId/childId/`) for efficient bulk queries. The tree is built recursively in `folderService.buildFolderTree()`.

**Q: How is folder size calculated recursively?**
> I use an iterative BFS queue. Start with the target folder, sum all direct image sizes, then enqueue all child folders. Repeat until the queue is empty. This avoids call stack overflow on deeply nested structures.

**Q: How is auth handled?**
> JWT-based: on login/register, a signed token is returned and stored in localStorage. Every API request attaches it as `Authorization: Bearer <token>`. The `protect` middleware verifies it on every protected route.

**Q: What is the MCP server?**
> It's a Model Context Protocol-compatible Express server that exposes DriveClone actions as AI tools. Claude Desktop or any LLM agent can call `create_folder`, `list_folders`, etc. using natural language → tool invocation.

---

## 🔧 Git Setup

```bash
# Initialize
git init
git add .
git commit -m "feat: initial DriveClone MERN stack implementation"

# Backend repo
cd backend
git remote add origin https://github.com/<you>/driveclone-backend
git push -u origin main

# Frontend repo
cd frontend
git remote add origin https://github.com/<you>/driveclone-frontend
git push -u origin main
```

---

## 💡 Possible Improvements

- [ ] Drag-and-drop folder reordering
- [ ] Share folders with other users (permissions system)
- [ ] File versioning / history
- [ ] Search across all folders and images
- [ ] Bulk download as ZIP
- [ ] Real-time collaboration with Socket.io
- [ ] PDF/video file support
- [ ] Admin dashboard with usage analytics
- [ ] Redis caching for folder size calculations
- [ ] WebSocket notifications for upload progress

---

## 📜 License

MIT — free to use in your portfolio, assignments, and interviews.
