const multer = require("multer");
const { toPublicUploadUrl } = require("../middleware/uploadMiddleware");

async function uploadFiles(req, res, next) {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ message: 'No files uploaded. Use multipart field "files".' });
    }

    const attachments = files.map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: toPublicUploadUrl(req, f.filename),
    }));

    res.status(201).json({ attachments });
  } catch (err) {
    next(err);
  }
}

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message, code: err.code });
  }
  next(err);
}

module.exports = { uploadFiles, multerErrorHandler };
