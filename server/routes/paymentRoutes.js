
const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createTestPayment } = require("../services/stripeService");

// Admin-only test payment endpoint
router.post("/test-payment", protect, adminOnly, async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (![1, 2].includes(amount)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be either $1 or $2.",
      });
    }

    const payment = await createTestPayment(amount);

    return res.status(200).json({
      success: true,
      message: "Stripe test payment processed.",
      payment,
      isTest: true,
    });
  } catch (error) {
    console.error("Stripe test payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Stripe test payment failed.",
    });
  }
});

module.exports = router;
