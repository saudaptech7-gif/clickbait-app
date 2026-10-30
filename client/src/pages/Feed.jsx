/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";

export default function Feed({ ads = [], loading = false, error = "" }) {
  const [page, setPage] = useState(1);
  const pageRefs = useRef([]);

  // Make sure ads is always an array
  const safeAds = Array.isArray(ads) ? ads : [];

  // Paused ads will not appear in the feed
  const activeAds = safeAds.filter(
    (ad) => ad && String(ad.status || "active").toLowerCase() !== "paused",
  );

  // Show 3 ads in each group
  const pageSize = 3;
  const adPages = [];

  for (let i = 0; i < activeAds.length; i += pageSize) {
    adPages.push(activeAds.slice(i, i + pageSize));
  }

  // Observe each group when it enters the screen
  useEffect(() => {
    if (loading || adPages.length === 0) {
      setPage(1);
      return;
    }

    const sections = pageRefs.current.filter(Boolean);

    // Fallback for browsers without IntersectionObserver
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

  // Open product website safely
  function openProductWebsite(productUrl) {
    if (!productUrl) return;

    try {
      const url = new URL(productUrl);

      if (!["https:", "http:"].includes(url.protocol)) {
        return;
      }

      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch {
      console.error("Invalid product website URL.");
    }
  }

  return (
    <div className="page-content">
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">PREVIEW EXPERIENCE</span>
          <h2>User Ad Feed</h2>
          <p>Scroll down to discover more advertisements.</p>
        </div>
      </div>

      {error && (
        <div className="notice notice-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="panel loading-state">Loading advertisements...</div>
      ) : activeAds.length === 0 ? (
        <div className="panel empty-state">
          <h3>No active ads available</h3>
          <p>
            Create an ad or activate a paused advertisement to preview it here.
          </p>
        </div>
      ) : (
        <>
          <div className="feed-toolbar">
            <span className="feed-current-page" aria-live="polite">
              Page {page}
            </span>

            <span>Keep scrolling ↓</span>
          </div>

          <div className="feed-pages">
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

                    const hasProductUrl = Boolean(ad.productUrl);

                    return (
                      <article
                        className="feed-card feed-card-animate"
                        key={ad._id || ad.id}
                      >
                        <div className="feed-image-wrap">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={ad.title || "Advertisement"}
                              loading={index === 0 ? "eager" : "lazy"}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="feed-image-placeholder">
                              Image unavailable
                            </div>
                          )}

                          <span className="feed-label">Sponsored</span>
                        </div>

                        <div className="feed-card-content">
                          <h3>{ad.title || "Untitled ad"}</h3>

                          <p>{ad.description || "No description provided."}</p>

                          {hasProductUrl && (
                            <button
                              type="button"
                              className="feed-visit-link"
                              onClick={() => openProductWebsite(ad.productUrl)}
                            >
                              Visit website ↗
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
        </>
      )}
    </div>
  );
}
