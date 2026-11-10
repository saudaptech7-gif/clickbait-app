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

    // Existing demo earning (not real money)
    simulatedRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Stripe Test Mode payment details
    stripePaymentIntentId: {
      type: String,
      default: "",
    },

    stripePaymentStatus: {
      type: String,
      enum: ["not_started", "succeeded", "failed"],
      default: "not_started",
    },

    stripeTestAmount: {
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
