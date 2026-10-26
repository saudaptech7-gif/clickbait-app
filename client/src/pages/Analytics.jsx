
import { useMemo } from "react";
import StatCard from "../components/StatCard";

export default function Analytics({ ads = [], loading, error }) {
  const data = useMemo(() => {
    const impressions = ads.reduce(
      (sum, ad) => sum + (Number(ad.impressions) || 0),
      0
    );

    const clicks = ads.reduce(
      (sum, ad) => sum + (Number(ad.clicks) || 0),
      0
    );

    const rankedAds = [...ads].sort(
      (a, b) => (Number(b.clicks) || 0) - (Number(a.clicks) || 0)
    );

    return {
      impressions,
      clicks,
      ctr: impressions
        ? ((clicks / impressions) * 100).toFixed(2)
        : "0.00",
      rankedAds,
    };
  }, [ads]);

  const maxClicks = Math.max(
    1,
    ...data.rankedAds.map((ad) => Number(ad.clicks) || 0)
  );

  return (
    <div className="page-content">
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">PERFORMANCE INSIGHTS</span>
          <h2>Analytics</h2>
          <p>Understand how your saved ad records are performing.</p>
        </div>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <div className="stats-grid">
        <StatCard
          title="Impressions"
          value={data.impressions.toLocaleString()}
          icon="◉"
          description="Recorded ad impressions"
          accent="blue"
        />

        <StatCard
          title="Clicks"
          value={data.clicks.toLocaleString()}
          icon="↗"
          description="Recorded ad clicks"
          accent="green"
        />

        <StatCard
          title="Click-through rate"
          value={`${data.ctr}%`}
          icon="%"
          description="Clicks divided by impressions"
          accent="purple"
        />

        <StatCard
          title="Total campaigns"
          value={ads.length.toLocaleString()}
          icon="▤"
          description="Ads stored in the database"
          accent="orange"
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Top ads by clicks</h2>
            <p>
              Ranked using the click counts currently stored in MongoDB.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading analytics...</div>
        ) : data.rankedAds.length === 0 ? (
          <div className="empty-state">
            <h3>No analytics yet</h3>
            <p>Create or import ads to see them listed here.</p>
          </div>
        ) : (
          <div className="ranking-list">
            {data.rankedAds.slice(0, 10).map((ad, index) => {
              const clicks = Number(ad.clicks) || 0;

              return (
                <div
                  className="ranking-row"
                  key={ad._id || ad.id || `${ad.title}-${index}`}
                >
                  <span className="ranking-number">{index + 1}</span>

                  <img
                    className="ranking-image"
                    src={ad.imageUrl}
                    alt={ad.title || "Advertisement"}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.classList.add("image-hidden");
                    }}
                  />

                  <div className="ranking-content">
                    <div className="ranking-title">
                      <strong>{ad.title || "Untitled ad"}</strong>
                      <span>{clicks.toLocaleString()} clicks</span>
                    </div>

                    <progress
                      className="bar-progress"
                      value={clicks}
                      max={maxClicks}
                      aria-label={`${ad.title || "Advertisement"} clicks`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="muted-note analytics-note">
        Note: These metrics are based on stored values. Live impression and
        click tracking must be implemented in the backend before these numbers
        represent actual user activity.
      </p>
    </div>
  );
}
