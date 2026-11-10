import { useEffect, useMemo, useRef } from "react";
import { trackImpression, trackClick } from "../services/api";
import UserNavbar from "../components/UserNavbar";

export default function Feed({
  ads = [],
  loading = false,
  error = "",
  user,
  onLogout,
}) {
  const adCardRefs = useRef([]);
  const trackedImpressions = useRef(new Set());
  const trackedClicks = useRef(new Set());

  const activeAds = useMemo(
    () =>
      (Array.isArray(ads) ? ads : []).filter(
        (ad) => ad && String(ad.status || "active").toLowerCase() === "active",
      ),
    [ads],
  );

  // Product website wale ads sabse upar
  const sortedAds = useMemo(() => {
    return [...activeAds].sort((a, b) => {
      const aClickable =
        typeof a.productUrl === "string" && a.productUrl.trim() !== "";

      const bClickable =
        typeof b.productUrl === "string" && b.productUrl.trim() !== "";

      return Number(bClickable) - Number(aClickable);
    });
  }, [activeAds]);

  // Impression tracking
  useEffect(() => {
    if (loading || !sortedAds.length) return;

    const cards = adCardRefs.current.filter(Boolean);
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const adId = entry.target.dataset.adId;
          if (!adId || trackedImpressions.current.has(adId)) return;

          trackedImpressions.current.add(adId);

          trackImpression(adId).catch((err) => {
            console.warn("Impression tracking failed:", err.message);
            trackedImpressions.current.delete(adId);
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [loading, sortedAds]);

  // Product website open aur click tracking
  async function openProductWebsite(ad) {
    if (!ad?.productUrl) return;

    let url;

    try {
      url = new URL(ad.productUrl);
      if (!["https:", "http:"].includes(url.protocol)) return;
    } catch {
      console.error("Invalid product website URL.");
      return;
    }

    const adId = ad._id || ad.id;

    if (!adId) {
      window.open(url.href, "_blank", "noopener,noreferrer");
      return;
    }

    const clickKey = String(adId);
    if (trackedClicks.current.has(clickKey)) return;

    trackedClicks.current.add(clickKey);

    const newWindow = window.open(url.href, "_blank", "noopener,noreferrer");

    try {
      const result = await trackClick(adId);

      console.log("Demo click recorded:", {
        clickId: result.clickId,
        demoEarning: result.demoEarning,
        isDemo: result.isDemo,
      });
    } catch (err) {
      console.warn("Click tracking failed:", err.message);
      trackedClicks.current.delete(clickKey);
    }

    if (!newWindow) {
      console.warn("Browser blocked the new tab.");
    }
  }

  function getImageUrl(ad) {
    const value = ad.imageUrl || ad.image || ad.image_url || "";
    return typeof value === "string" ? value.trim() : "";
  }

  return (
    <main className="public-feed-page">
      <UserNavbar user={user} onLogout={onLogout} />

      <section className="public-feed-advertisements">
        {error && (
          <div className="public-feed-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="public-feed-state">
            <div className="public-feed-loader" />
          </div>
        ) : sortedAds.length === 0 ? (
          <div className="public-feed-state">No advertisements available.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 50px)",
              gridAutoRows: "50px",
              gap: "8px",
              alignItems: "start",
            }}
          >
            {sortedAds.map((ad, index) => {
              const imageUrl = getImageUrl(ad);
              const adId = ad._id || ad.id;

              return (
                <article
                  key={adId || index}
                  data-ad-id={adId || ""}
                  ref={(element) => {
                    adCardRefs.current[index] = element;
                  }}
                  onClick={() => openProductWebsite(ad)}
                  role={ad.productUrl ? "link" : undefined}
                  tabIndex={ad.productUrl ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (
                      ad.productUrl &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      openProductWebsite(ad);
                    }
                  }}
                  aria-label={ad.title || "Advertisement"}
                  style={{
                    width: "50px",
                    height: "50px",
                    minWidth: "50px",
                    minHeight: "50px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    overflow: "hidden",
                    padding: "2px",
                    margin: 0,
                    position: "relative",
                    background: "#ffffff",
                    border: "1px solid #dddddd",
                    borderRadius: "4px",
                    cursor: ad.productUrl ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "30px",
                      minHeight: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={ad.title || "Advertisement"}
                        loading="lazy"
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        AD
                      </span>
                    )}
                  </div>

                  <div
                    title={ad.title || ""}
                    style={{
                      width: "100%",
                      height: "14px",
                      minHeight: "14px",
                      overflow: "hidden",
                      fontSize: "6px",
                      lineHeight: "12px",
                      fontWeight: 600,
                      color: "#222222",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ad.title || "No title"}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
