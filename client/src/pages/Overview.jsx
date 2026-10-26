
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";

export default function Overview({ ads = [], loading, error }) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const impressions = ads.reduce(
      (sum, ad) => sum + (Number(ad.impressions) || 0),
      0
    );

    const clicks = ads.reduce(
      (sum, ad) => sum + (Number(ad.clicks) || 0),
      0
    );

    return {
      total: ads.length,
      active: ads.filter((ad) => ad.status !== "paused").length,
      impressions,
      clicks,
      ctr: impressions
        ? ((clicks / impressions) * 100).toFixed(2)
        : "0.00",
    };
  }, [ads]);

  return (
    <div className="page-content">
      <div className="welcome-banner">
        <div>
          <span className="eyebrow">CAMPAIGN CONTROL CENTER</span>
          <h2>Your advertising overview</h2>
          <p>
            Manage campaigns, monitor performance and organize your ads.
          </p>
        </div>

        <Link to="/create-ad" className="button button-light">
          + Create new ad
        </Link>
      </div>

      {error && (
        <div className="notice notice-error" role="alert">
          {error}
        </div>
      )}

      <div className="section-heading">
        <div>
          <h2>Performance overview</h2>
          <p>Metrics calculated from the ad records in your database.</p>
        </div>

        <Link to="/analytics" className="text-link">
          View analytics →
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total ads"
          value={stats.total.toLocaleString()}
          icon="▤"
          description="Ads in your database"
        />

        <StatCard
          title="Active ads"
          value={stats.active.toLocaleString()}
          icon="◉"
          description="Not currently paused"
          accent="green"
        />

        <StatCard
          title="Impressions"
          value={stats.impressions.toLocaleString()}
          icon="◉"
          description="Recorded impressions"
          accent="blue"
        />

        <StatCard
          title="Total clicks"
          value={stats.clicks.toLocaleString()}
          icon="↗"
          description={`CTR: ${stats.ctr}%`}
          accent="orange"
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent advertisements</h2>
            <p>
              {loading
                ? "Loading ads..."
                : `${ads.length} ads available`}
            </p>
          </div>

          <Link to="/ads" className="button button-secondary">
            Manage ads
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading advertisements...
          </div>
        ) : ads.length === 0 ? (
          <div className="empty-state">
            <h3>No advertisements yet</h3>
            <p>Create your first ad to see it here.</p>
            <Link to="/create-ad" className="button button-primary">
              Create ad
            </Link>
          </div>
        ) : (
          <div className="overview-ad-list">
            {ads.slice(0, 5).map((ad) => (
              <button
                type="button"
                className="overview-ad-item"
                key={ad._id || ad.id}
                onClick={() => navigate("/ads")}
                title="Open Ads Management"
              >
                <span className="overview-ad-info">
                  <strong>{ad.title || "Untitled advertisement"}</strong>
                  <small>
                    {ad.description || "No description available"}
                  </small>
                </span>

                <span
                  className={`status-badge ${
                    ad.status === "paused"
                      ? "status-paused"
                      : "status-active"
                  }`}
                >
                  {ad.status === "paused" ? "Paused" : "Active"}
                </span>

                <span className="overview-ad-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
