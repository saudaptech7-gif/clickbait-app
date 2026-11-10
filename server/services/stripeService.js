const Stripe = require("stripe");

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey || !stripeKey.startsWith("sk_test_")) {
  throw new Error("Valid Stripe test secret key is required.");
}

const stripe = new Stripe(stripeKey);

async function createTestPayment(amount, adId) {
  const value = Number(amount);

  if (![1, 2].includes(value)) {
    throw new Error("Amount must be $1 or $2.");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: value * 100,
    currency: "usd",

    // Updated Stripe API: card-only allowlist
    allowed_payment_method_types: ["card"],

    payment_method: "pm_card_visa",
    confirm: true,

    description: "Clickbait App - Ad Click Test",

    metadata: {
      app: "Clickbait App",
      paymentType: "test_ad_click",
      adId: String(adId),
      testMode: "true",
    },
  });

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };
}

module.exports = { createTestPayment };
