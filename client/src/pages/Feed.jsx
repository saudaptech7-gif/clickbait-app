import { useEffect, useRef, useState } from "react";
import { trackImpression, trackClick } from "../services/api";


export default function Feed({ ads = [], loading = false, error = "" }) {
  const [page, setPage] = useState(1);
  const pageRefs = useRef([]);
  const adCardRefs = useRef([]);
  const trackedImpressions = useRef(new Set());

  const safeAds = Array.isArray(ads) ? ads : [];

  const activeAds = safeAds.filter(
    (ad) => ad && String(ad.status || "active").toLowerCase() === "active",
  );

  const pageSize = 3;
  const adPages = [];

  for (let i = 0; i < activeAds.length; i += pageSize) {
    adPages.push(activeAds.slice(i, i + pageSize));
  }

  // =====================================
  // PAGE SCROLL OBSERVER
  // =====================================

  useEffect(() => {
    if (loading || adPages.length === 0) {
      return;
    }

    const sections = pageRefs.current.filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => {
        section.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            const currentPage = Number(entry.target.dataset.page);

            if (currentPage) {
              setPage(currentPage);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading, activeAds.length]);

  // =====================================
  // IMPRESSION TRACKING
  // =====================================

  useEffect(() => {
    if (loading || activeAds.length === 0) {
      return;
    }

    const cards = adCardRefs.current.filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => {
        const adId = card.dataset.adId;

        if (adId && !trackedImpressions.current.has(adId)) {
          trackedImpressions.current.add(adId);

          trackImpression(adId).catch((err) => {
            console.warn("Impression tracking failed:", err.message);
          });
        }
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const adId = entry.target.dataset.adId;

          if (!adId || trackedImpressions.current.has(adId)) {
            return;
          }

          trackedImpressions.current.add(adId);

          trackImpression(adId).catch((err) => {
            console.warn("Impression tracking failed:", err.message);
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.5,
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [loading, activeAds]);

  // =====================================
  // OPEN PRODUCT WEBSITE
  // =====================================

  function openProductWebsite(ad) {
    if (!ad?.productUrl) return;

    let url;

    try {
      url = new URL(ad.productUrl);

      if (!["https:", "http:"].includes(url.protocol)) {
        return;
      }
    } catch {
      console.error("Invalid product website URL.");
      return;
    }

    const newWindow = window.open(url.href, "_blank", "noopener,noreferrer");

    if (newWindow) {
      newWindow.opener = null;
    }

    if (ad._id) {
      trackClick(ad._id).catch((err) => {
        console.warn("Click tracking failed:", err.message);
      });
    }
  }

  return (
    <main className="public-feed-page">
      {/* =====================================
          HERO SECTION
      ===================================== */}

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
            Explore Advertisements
            <span aria-hidden="true">↓</span>
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

      {/* =====================================
          ADVERTISEMENTS SECTION
      ===================================== */}

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
            <p>
              There are no active advertisements at the moment. Please check
              back later.
            </p>
          </div>
        ) : (
          <>
            <div className="public-feed-toolbar">
              <span>Showing {activeAds.length} advertisements</span>

              <span className="public-feed-page-indicator">
                Page {page} of {adPages.length}
              </span>
            </div>

            <div className="public-feed-pages">
              {adPages.map((group, index) => (
                <section
                  className={`feed-page-section ${
                    index === 0 ? "is-visible" : ""
                  }`}
                  key={group[0]?._id || group[0]?.id || index}
                  data-page={index + 1}
                  ref={(element) => {
                    pageRefs.current[index] = element;
                  }}
                >
                  <div className="feed-grid">
                    {group.map((ad) => {
                      const imageUrl =
                        ad.imageUrl || ad.image || ad.image_url || "";

                      const adId = ad._id || ad.id;

                      return (
                        <article
                          className="feed-card feed-card-animate"
                          key={adId}
                          data-ad-id={ad._id || ""}
                          ref={(element) => {
                            const cardIndex = activeAds.indexOf(ad);
                            adCardRefs.current[cardIndex] = element;
                          }}
                        >
                          <div className="feed-image-wrap">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={ad.title || "Advertisement"}
                                loading={index === 0 ? "eager" : "lazy"}
                                onError={(event) => {
                                  event.currentTarget.classList.add(
                                    "feed-image-hidden",
                                  );
                                }}
                              />
                            ) : null}

                            <div className="feed-image-placeholder">
                              Image unavailable
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

                            {ad.productUrl && (
                              <button
                                type="button"
                                className="feed-visit-link"
                                onClick={() => openProductWebsite(ad)}
                              >
                                Visit Website
                                <span aria-hidden="true">↗</span>
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
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
