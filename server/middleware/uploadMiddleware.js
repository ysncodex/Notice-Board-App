const path = require("path");
const multer = require("multer");
const { UPLOAD_DIR, makeUploadFilename } = require("../config/upload");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(
      null,
      makeUploadFilename({
        originalname: file.originalname,
        mimetype: file.mimetype,
      })
    ),
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp, pdf`
      )
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

function toPublicUploadUrl(req, filename) {
  return path.posix.join("/uploads", filename);
}

module.exports = { upload, toPublicUploadUrl };
