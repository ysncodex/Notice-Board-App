## Notice Board App

### Project overview
Notice board system with:
- Create notice (publish or save draft)
- Attachments upload (pdf/images)
- Notice listing with filters, pagination, status toggle
- Edit existing notice

### Tech stack
- **Frontend**: React (Vite), React Router, TailwindCSS, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), Multer (uploads)

### Live URLs (fill after deployment)
- **Frontend**: `<YOUR_FRONTEND_URL>`
- **Backend**: `<YOUR_BACKEND_URL>`

### API base URL
Frontend reads the API base URL from:
- **`VITE_API_URL`** (example: `http://localhost:5000`)

### Installation (local)

#### 1) Backend
```bash
cd server
npm i
```

Create `server/.env` using `server/env.example`:
- **`MONGO_URI`** (required)
- **`PORT`** (optional, default 5000)

Run:
```bash
npm run dev
```

Backend will run on: `http://localhost:5000`

#### 2) Frontend
```bash
cd client
npm i
```

Create `client/.env` using `client/env.example`:
- **`VITE_API_URL`** (required)

Run:
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Deployment (Vercel + Render/Railway)

#### Frontend (Vercel)
- Project root: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Env var:
  - `VITE_API_URL = <YOUR_BACKEND_URL>`
- SPA routing: `client/vercel.json` is included for React Router refresh support.

#### Backend (Render)
- Create a new **Web Service**
- Root directory: `server`
- Build command: `npm i`
- Start command: `npm start`
- Env vars:
  - `MONGO_URI`
  - `NODE_ENV=production`

#### Backend (Railway)
- Deploy from GitHub
- Root directory: `server`
- Start command: `npm start`
- Env vars:
  - `MONGO_URI`
  - `NODE_ENV=production`

> Note: uploads are stored on the server filesystem (`server/uploads`). Some platforms use ephemeral storage; for permanent uploads use S3/Cloudinary.

### Repository link (fill after pushing)
- GitHub: `<YOUR_GITHUB_REPO_URL>`


