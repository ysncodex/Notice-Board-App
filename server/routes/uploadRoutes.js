const express = require("express");
const { upload } = require("../middleware/uploadMiddleware");
const {
  uploadFiles,
  multerErrorHandler,
} = require("../controllers/uploadController");

const router = express.Router();

router.post("/", upload.array("files", 5), uploadFiles, multerErrorHandler);

module.exports = router;
