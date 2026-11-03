import { useState } from "react";
import { createCampaignCheckout } from "../services/api";

const packages = [
  {
    id: "starter",
    title: "Starter",
    price: "$10",
    detail: "For a small campaign",
  },
  {
    id: "growth",
    title: "Growth",
    price: "$25",
    detail: "For a growing campaign",
  },
  {
    id: "premium",
    title: "Premium",
    price: "$50",
    detail: "For a larger campaign",
  },
];

export default function Advertise() {
  const [values, setValues] = useState({
    campaignName: "",
    email: "",
    packageName: "starter",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelled =
    new URLSearchParams(window.location.search).get("payment") === "cancelled";

  function update(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createCampaignCheckout(values);
      if (!result.checkoutUrl)
        throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      setError(err.message || "Unable to start checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="payment-page">
      <section className="payment-card">
        <span className="eyebrow">ADVERTISER PORTAL · TEST MODE</span>
        <h1>Promote your campaign</h1>
        <p>
          Choose a test package and continue to Stripe's secure test checkout.
        </p>
        {cancelled && (
          <div className="notice notice-error">
            Checkout was cancelled. No payment was completed.
          </div>
        )}
        {error && (
          <div className="notice notice-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="payment-form">
          <label>
            Campaign name
            <input
              name="campaignName"
              value={values.campaignName}
              onChange={update}
              minLength="3"
              maxLength="120"
              required
              placeholder="Example: Summer collection"
            />
          </label>
          <label>
            Contact email
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={update}
              required
              placeholder="you@example.com"
            />
          </label>
          <fieldset>
            <legend>Select a test package</legend>
            <div className="payment-packages">
              {packages.map((item) => (
                <label
                  className={`payment-package ${values.packageName === item.id ? "selected" : ""}`}
                  key={item.id}
                >
                  <input
                    type="radio"
                    name="packageName"
                    value={item.id}
                    checked={values.packageName === item.id}
                    onChange={update}
                  />
                  <strong>{item.title}</strong>
                  <b>{item.price}</b>
                  <small>{item.detail}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            className="button button-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Connecting to Stripe..."
              : "Continue to Stripe Checkout"}
          </button>
        </form>
        <p className="payment-disclaimer">
          Test mode only. These packages do not charge real money. A verified
          test payment is stored for demonstration.
        </p>
      </section>
    </main>
  );
}
