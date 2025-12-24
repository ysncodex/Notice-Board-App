const mongoose = require("mongoose");
const Notice = require("../models/Notice");

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function createNotice(req, res, next) {
  try {
    const payload = req.body || {};
    const notice = await Notice.create(payload);
    res.status(201).json(notice);
  } catch (err) {
    next(err);
  }
}

async function getNotices(req, res, next) {
  try {
    const { status, active } = req.query;

    const filter = {};
    if (typeof status === "string" && status.trim()) {
      filter.status = status.trim();
    } else if (String(active).toLowerCase() === "true") {
      filter.status = "Published";
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notice.find(filter)
        .sort({ publishDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notice.countDocuments(filter),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getNoticeById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notice id" });
    }

    const notice = await Notice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    res.json(notice);
  } catch (err) {
    next(err);
  }
}

async function updateNoticeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notice id" });
    }
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const notice = await Notice.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json(notice);
  } catch (err) {
    next(err);
  }
}

async function updateNotice(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notice id" });
    }

    const notice = await Notice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    res.json(notice);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNoticeStatus,
  updateNotice,
};
