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

  const activeAds = useMemo(
    () =>
      (Array.isArray(ads) ? ads : []).filter(
        (ad) => ad && String(ad.status || "active").toLowerCase() === "active",
      ),
    [ads],
  );

  // Instagram-style scroll reveal animation
  useEffect(() => {
    if (loading || activeAds.length === 0) return;

    const cards = adCardRefs.current.filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => {
        card.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [loading, activeAds]);

  // Track ad impressions
  useEffect(() => {
    if (loading || activeAds.length === 0) return;

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
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [loading, activeAds]);

  // Open product website
  function openProductWebsite(ad) {
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

    if (adId) {
      trackClick(adId).catch((err) => {
        console.warn("Click tracking failed:", err.message);
      });
    }

    window.open(url.href, "_blank", "noopener,noreferrer");
  }

  // Get advertisement image
  function getImageUrl(ad) {
    const value = ad.imageUrl || ad.image || ad.image_url || "";
    return typeof value === "string" ? value.trim() : "";
  }

  return (
    <main className="public-feed-page">
      <UserNavbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="public-feed-hero">
        <div className="public-feed-hero-content">
          <span className="public-feed-eyebrow">
            DISCOVER • EXPLORE • EXPERIENCE
          </span>

          <h1>
            Discover Something
            <span> Interesting.</span>
          </h1>

          <p>
            Explore featured advertisements, discover products, and find
            something that catches your interest.
          </p>

          <a href="#advertisements" className="public-feed-hero-button">
            Explore Advertisements <span>↓</span>
          </a>

          <div className="public-feed-scroll-message">
            <span className="public-feed-scroll-icon">↓</span>
            <strong>Scroll Down for Advertisements</strong>
            <span>Discover what's featured below</span>
          </div>
        </div>

        <div className="public-feed-hero-decoration">
          <div className="public-feed-decoration-circle circle-one" />
          <div className="public-feed-decoration-circle circle-two" />

          <div className="public-feed-decoration-card">
            <span className="decoration-card-icon">✦</span>
            <span>Discover more</span>
            <strong>Explore new ideas</strong>
          </div>
        </div>
      </section>

      {/* Advertisements Section */}
      <section className="public-feed-advertisements" id="advertisements">
        <div className="public-feed-section-heading">
          <div>
            <span className="public-feed-eyebrow">FEATURED CONTENT</span>

            <h2>Explore Advertisements</h2>

            <p>
              Browse the latest advertisements and discover featured products.
            </p>
          </div>

          {!loading && activeAds.length > 0 && (
            <div className="public-feed-total">
              <strong>{activeAds.length}</strong>
              <span>Advertisements</span>
            </div>
          )}
        </div>

        {error && (
          <div className="public-feed-error" role="alert">
            <strong>Unable to load advertisements</strong>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="public-feed-state">
            <div className="public-feed-loader" />
            <h3>Loading advertisements</h3>
            <p>Please wait while we load the latest ads.</p>
          </div>
        ) : activeAds.length === 0 ? (
          <div className="public-feed-state">
            <div className="public-feed-empty-icon">✦</div>
            <h3>No advertisements available</h3>
            <p>There are no active advertisements at the moment.</p>
          </div>
        ) : (
          <>
            <div className="public-feed-toolbar">
              <span>Showing {activeAds.length} advertisements</span>

              <span>All active advertisements</span>
            </div>

            <div className="feed-grid">
              {activeAds.map((ad, index) => {
                const imageUrl = getImageUrl(ad);
                const adId = ad._id || ad.id;

                return (
                  <article
                    className="feed-card feed-card-animate"
                    key={adId || index}
                    data-ad-id={adId || ""}
                    ref={(element) => {
                      adCardRefs.current[index] = element;
                    }}
                    style={{
                      transitionDelay: `${(index % 3) * 100}ms`,
                    }}
                  >
                    <div className="feed-image-wrap">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={ad.title || "Advertisement"}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.classList.add(
                              "feed-image-hidden",
                            );

                            event.currentTarget.parentElement.classList.add(
                              "image-load-failed",
                            );
                          }}
                        />
                      ) : null}

                      <div className="feed-image-placeholder">
                        <span>✦</span>
                        <strong>Image unavailable</strong>
                      </div>

                      <span className="feed-label">Sponsored</span>
                    </div>

                    <div className="feed-card-content">
                      <span className="feed-card-category">
                        FEATURED ADVERTISEMENT
                      </span>

                      <h3>{ad.title || "Untitled advertisement"}</h3>

                      <p>
                        {ad.description ||
                          "Discover more about this featured advertisement."}
                      </p>

                      <div className="feed-card-action">
                        {ad.productUrl ? (
                          <button
                            type="button"
                            className="feed-visit-link"
                            onClick={() => openProductWebsite(ad)}
                          >
                            Visit Website <span>↗</span>
                          </button>
                        ) : (
                          <span
                            className="feed-visit-placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="public-feed-bottom-message">
              <span>✦</span>
              You've reached the end of the advertisements.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
