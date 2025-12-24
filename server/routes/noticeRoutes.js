const express = require("express");
const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNoticeStatus,
  updateNotice,
} = require("../controllers/noticeController");

const router = express.Router();

router.route("/").post(createNotice).get(getNotices);
router.route("/:id").get(getNoticeById).put(updateNotice);
router.route("/:id/status").patch(updateNoticeStatus);

module.exports = router;
