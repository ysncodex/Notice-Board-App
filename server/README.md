## Server (Express + MongoDB)

### Setup

- **Install**: `npm i`
- **Env**: create `server/.env` (not committed) using `server/env.example` as a reference
- **Run (dev)**: `npm run dev`

### API

Base URL: `/api/notices`

- **Create notice**: `POST /api/notices`
- **Get notices**: `GET /api/notices?status=Published|Draft|Unpublished` (or `?active=true` for Published)
- **Get single notice**: `GET /api/notices/:id`
- **Update status**: `PATCH /api/notices/:id/status`
- **Update notice** (extra): `PUT /api/notices/:id`

### Meta (dropdown data)

- **All meta**: `GET /api/meta`
- **Departments/Individual list**: `GET /api/meta/departments`
- **Notice types list**: `GET /api/meta/notice-types`

### Upload attachments

Uploads are stored locally in `server/uploads/` and served at `/uploads/...`

- **Upload one/many files**: `POST /api/uploads`
  - Content-Type: `multipart/form-data`
  - Field name: `files` (supports up to 5 files, 10MB each)
  - Allowed: jpg, png, webp, pdf
  - Response: `{ attachments: [{ url, filename, originalname, mimetype, size }] }`


