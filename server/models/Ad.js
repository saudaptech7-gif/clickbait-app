
const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    productUrl: {
      type: String,
      trim: true,
      default: "",
    },
    dimensions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

adSchema.index({ imageUrl: 1 }, { unique: true });

module.exports = mongoose.model("Ad", adSchema);
