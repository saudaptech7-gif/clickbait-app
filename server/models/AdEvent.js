const mongoose = require("mongoose");

const adEventSchema = new mongoose.Schema(
  {
    ad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
      index: true,
    },

    eventType: {
      type: String,
      enum: ["impression", "click"],
      required: true,
    },

    // Demo-only revenue. This does not represent a real payment.
    simulatedRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

adEventSchema.index({ eventType: 1, createdAt: -1 });
adEventSchema.index({ ad: 1, eventType: 1 });

module.exports =
  mongoose.models.AdEvent || mongoose.model("AdEvent", adEventSchema);
