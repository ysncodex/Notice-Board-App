const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function safeExtFromMimetype(mimetype) {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

function makeUploadFilename({ originalname, mimetype }) {
  const originalExt = path.extname(originalname || "").toLowerCase();
  const fallbackExt = safeExtFromMimetype(mimetype);
  const ext = originalExt || fallbackExt || "";

  const id = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${id}${ext}`;
}

module.exports = { UPLOAD_DIR, makeUploadFilename };
