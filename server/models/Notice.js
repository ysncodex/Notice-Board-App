const mongoose = require("mongoose");
const { NOTICE_TYPES } = require("../config/meta");

const recipientDetailsSchema = new mongoose.Schema(
  {
    employeeId: { type: String, trim: true },
    name: { type: String, trim: true },
    position: { type: String, trim: true },
  },
  { _id: false }
);

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Notice Title is required"],
    },
    targetAudience: {
      type: String,
      trim: true,
      required: [true, "Target audience is required"],
    },
    recipientDetails: {
      type: recipientDetailsSchema,
      default: undefined,
    },
    noticeType: {
      type: [{ type: String, trim: true, enum: NOTICE_TYPES }],
      required: [true, "Notice type is required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one Notice Type is required",
      },
    },
    publishDate: {
      type: Date,
      required: [true, "Publish date is required"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    attachments: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["Published", "Unpublished", "Draft"],
      default: "Published",
    },
  },
  { timestamps: true }
);

noticeSchema.pre("validate", function () {
  const target = String(this.targetAudience || "")
    .trim()
    .toLowerCase();
  if (target === "individual") {
    const rd = this.recipientDetails || {};
    if (!rd.employeeId) {
      this.invalidate(
        "recipientDetails.employeeId",
        "recipientDetails.employeeId is required when targetAudience is Individual"
      );
    }
  }
});

module.exports = mongoose.model("Notice", noticeSchema);
