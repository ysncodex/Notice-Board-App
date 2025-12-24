const express = require("express");
const { DEPARTMENTS_OR_INDIVIDUAL, NOTICE_TYPES } = require("../config/meta");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    departmentsOrIndividual: DEPARTMENTS_OR_INDIVIDUAL,
    noticeTypes: NOTICE_TYPES,
  });
});
router.get("/departments", (req, res) => res.json(DEPARTMENTS_OR_INDIVIDUAL));
router.get("/notice-types", (req, res) => res.json(NOTICE_TYPES));

module.exports = router;
