
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdForm from "../components/AdForm";

export default function CreateAd({ onCreate }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleCreate(values) {
    setSubmitting(true);
    setError("");

    try {
      await onCreate(values);
      navigate("/ads", {
        state: { message: "Advertisement created successfully." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-content narrow-page">
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">NEW CAMPAIGN</span>
          <h2>Create an advertisement</h2>
          <p>Add your ad details and connect an online image.</p>
        </div>
        <Link to="/ads" className="button button-secondary">Back to ads</Link>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <section className="panel">
        <AdForm onSubmit={handleCreate} submitting={submitting} />
      </section>
    </div>
  );
}
