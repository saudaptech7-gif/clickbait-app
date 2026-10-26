
import { useEffect, useRef, useState } from "react";

export default function Feed({ ads = [], loading, error }) {
  const [page, setPage] = useState(1);
  const pageRefs = useRef([]);

  const activeAds = ads.filter((ad) => ad.status !== "paused");
  const pageSize = 3;
  const adPages = [];

  for (let i = 0; i < activeAds.length; i += pageSize) {
    adPages.push(activeAds.slice(i, i + pageSize));
  }

  useEffect(() => {
    if (loading || adPages.length === 0) return;

    const sections = pageRefs.current.filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            setPage(Number(entry.target.dataset.page));
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading, activeAds.length]);

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
        <div className="panel loading-state">Loading feed...</div>
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
                className="feed-page-section"
                key={group[0]?._id || group[0]?.id || index}
                data-page={index + 1}
                ref={(element) => {
                  pageRefs.current[index] = element;
                }}
              >
                <div className="feed-grid">
                  {group.map((ad) => {
                    const hasProductUrl = Boolean(ad.productUrl);

                    return (
                      <article
                        className={`feed-card feed-card-animate${
                          hasProductUrl ? " feed-card-clickable" : ""
                        }`}
                        key={ad._id || ad.id}
                        onClick={() =>
                          openProductWebsite(ad.productUrl)
                        }
                        onKeyDown={(event) => {
                          if (
                            hasProductUrl &&
                            (event.key === "Enter" || event.key === " ")
                          ) {
                            event.preventDefault();
                            openProductWebsite(ad.productUrl);
                          }
                        }}
                        role={hasProductUrl ? "link" : undefined}
                        tabIndex={hasProductUrl ? 0 : undefined}
                        aria-label={
                          hasProductUrl
                            ? `Visit ${ad.title || "product website"}`
                            : undefined
                        }
                      >
                        <div className="feed-image-wrap">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title || "Advertisement"}
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                          <span className="feed-label">Sponsored</span>
                        </div>

                        <div className="feed-card-content">
                          <h3>{ad.title || "Untitled ad"}</h3>
                          <p>
                            {ad.description || "No description provided."}
                          </p>

                          {hasProductUrl && (
                            <span className="feed-visit-link">
                              Visit website ↗
                            </span>
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
