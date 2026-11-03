/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCheckoutStatus } from "../services/api";

export default function PaymentSuccess() {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const sessionId = new URLSearchParams(window.location.search).get(
    "session_id",
  );

  useEffect(() => {
    let active = true;
    if (!sessionId) {
      setError("Checkout session was not provided.");
      setLoading(false);
      return () => {
        active = false;
      };
    }
    getCheckoutStatus(sessionId)
      .then((result) => {
        if (active) setPayment(result.payment);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <main className="payment-page">
      <section className="payment-card payment-result">
        <span className="eyebrow">STRIPE TEST CHECKOUT</span>
        <h1>
          {loading
            ? "Checking payment..."
            : payment?.status === "paid"
              ? "Test payment confirmed"
              : "Payment received for verification"}
        </h1>
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          payment && (
            <>
              <p>
                Campaign: <strong>{payment.campaignName}</strong>
              </p>
              <p>
                Amount:{" "}
                <strong>
                  ${(payment.amount / 100).toFixed(2)}{" "}
                  {payment.currency.toUpperCase()}
                </strong>
              </p>
              <p>
                Status: <strong>{payment.status}</strong>
              </p>
            </>
          )
        )}
        <p className="payment-disclaimer">
          This is a Stripe test-mode transaction. No real money was charged.
        </p>
        <Link className="button button-primary" to="/">
          Return to public feed
        </Link>
      </section>
    </main>
  );
}
