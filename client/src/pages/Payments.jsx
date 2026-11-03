import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { getAdminPayments } from "../services/api";

export default function Payments({ token }) {
  const [data, setData] = useState({
    payments: [],
    totalPaidUsd: 0,
    paidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminPayments(token)
      .then((result) => {
        if (active) setData(result);
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
  }, [token]);

  return (
    <div className="page-content">
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">PAYMENT MANAGEMENT</span>
          <h2>Payments</h2>
          <p>Advertiser campaign payments recorded through Stripe Test Mode.</p>
        </div>
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="stats-grid">
        <StatCard
          title="Confirmed test payments"
          value={data.paidCount.toLocaleString()}
          icon="✓"
          description="Webhook-confirmed payments"
          accent="green"
        />
        <StatCard
          title="Test payment total"
          value={`$${Number(data.totalPaidUsd).toFixed(2)}`}
          icon="$"
          description="Test-mode records only"
          accent="blue"
        />
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent payment records</h2>
            <p>Latest 200 checkout records.</p>
          </div>
        </div>
        {loading ? (
          <div className="loading-state">Loading payment records...</div>
        ) : data.payments.length === 0 ? (
          <div className="empty-state">
            <h3>No payment records yet</h3>
            <p>Advertiser test checkouts will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.campaignName}</td>
                    <td>{payment.customerEmail}</td>
                    <td>{payment.packageName}</td>
                    <td>${(payment.amount / 100).toFixed(2)}</td>
                    <td>
                      <span
                        className={`status-badge ${payment.status === "paid" ? "status-active" : "status-paused"}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="muted-note">
       it is important to note that these payment records are for demonstration purposes only and do not represent real financial transactions.
      </p>
    </div>
  );
}
