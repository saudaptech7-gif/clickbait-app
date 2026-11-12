import { useEffect, useMemo, useRef } from "react";
import { trackImpression, trackClick } from "../services/api";

export default function Feed({ ads = [], loading = false, error = "" }) {
  const cardRefs = useRef([]);
  const trackedImpressions = useRef(new Set());
  const trackedClicks = useRef(new Set());

  const activeAds = useMemo(() => {
    return (Array.isArray(ads) ? ads : []).filter(
      (ad) => ad && String(ad.status || "active").toLowerCase() === "active",
    );
  }, [ads]);

  const sortedAds = useMemo(() => {
    return [...activeAds].sort((a, b) => {
      const aClickable = Boolean(
        typeof a.productUrl === "string" && a.productUrl.trim(),
      );

      const bClickable = Boolean(
        typeof b.productUrl === "string" && b.productUrl.trim(),
      );

      return Number(bClickable) - Number(aClickable);
    });
  }, [activeAds]);

  function getImageUrl(ad) {
    const value = ad.imageUrl || ad.image || ad.image_url || "";
    return typeof value === "string" ? value.trim() : "";
  }

  function handleImageLoad(event) {
    const img = event.currentTarget;
    const card = img.closest(".savor-wall-item");

    if (!card || !img.naturalWidth || !img.naturalHeight) return;

    const ratio = img.naturalWidth / img.naturalHeight;

    card.dataset.ratio = String(ratio);

    const baseWidth = Math.max(35, Math.min(70, 50 * ratio));
    const previewWidth = Math.min(220, 260 * ratio);

    card.style.setProperty("--savor-ratio", ratio);
    card.style.setProperty("--savor-base-width", `${baseWidth}px`);
    card.style.setProperty("--savor-preview-width", `${previewWidth}px`);
  }

  function handlePreviewEnter(event) {
    const card = event.currentTarget;
    const ratio = Number(card.dataset.ratio) || 1;

    const previewWidth = Math.min(220, 260 * ratio, window.innerWidth - 24);

    const imageHeight = previewWidth / ratio;
    const previewHeight = imageHeight + 75;

    const rect = card.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.top;
    const spaceAbove = rect.bottom;

    card.classList.toggle(
      "savor-open-left",
      rect.left + previewWidth > window.innerWidth - 12,
    );

    card.classList.toggle(
      "savor-open-up",
      spaceBelow < previewHeight && spaceAbove > spaceBelow,
    );
  }

  function handlePreviewLeave(event) {
    event.currentTarget.classList.remove("savor-open-left", "savor-open-up");
  }

  useEffect(() => {
    if (loading || !sortedAds.length) return;
    if (!("IntersectionObserver" in window)) return;

    const cards = cardRefs.current.filter(Boolean);

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

  function handleCardKeyDown(event, ad) {
    if (event.key === "Enter" || event.key === " ") {
      if (!ad?.productUrl) return;

      event.preventDefault();
      openProductWebsite(ad);
    }
  }

  return (
    <main className="savor-wall-page">
      <section className="savor-wall-content">
        {error && (
          <div className="savor-wall-message savor-wall-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="savor-wall-message">
            <div className="savor-wall-spinner" />
          </div>
        ) : sortedAds.length === 0 ? (
          <div className="savor-wall-message">No advertisements available.</div>
        ) : (
          <div className="savor-wall-grid">
            {sortedAds.map((ad, index) => {
              const imageUrl = getImageUrl(ad);
              const adId = ad._id || ad.id;

              const clickable = Boolean(
                typeof ad.productUrl === "string" && ad.productUrl.trim(),
              );

              return (
                <article
                  key={adId || index}
                  className="savor-wall-item"
                  data-ad-id={adId || ""}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  onMouseEnter={handlePreviewEnter}
                  onMouseLeave={handlePreviewLeave}
                  onFocus={handlePreviewEnter}
                  onBlur={handlePreviewLeave}
                  onClick={() => {
                    if (clickable) openProductWebsite(ad);
                  }}
                  onKeyDown={(event) => handleCardKeyDown(event, ad)}
                  role={clickable ? "link" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={ad.title || "Advertisement"}
                >
                  <div className="savor-wall-preview">
                    <div className="savor-wall-photo">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={ad.title || "Advertisement"}
                          loading="lazy"
                          onLoad={handleImageLoad}
                          onError={(event) => {
                            console.error(
                              "Image failed:",
                              event.currentTarget.src,
                            );

                            event.currentTarget.classList.add(
                              "savor-image-error",
                            );
                          }}
                        />
                      ) : (
                        <span className="savor-wall-placeholder">AD</span>
                      )}

                      <span className="savor-wall-image-error">
                        Image unavailable
                      </span>
                    </div>

                    <div className="savor-wall-caption">
                      <span className="savor-wall-heading">
                        {ad.title || "Untitled advertisement"}
                      </span>

                      {clickable && (
                        <span className="savor-wall-subheading">
                          VIEW ADVERTISEMENT
                        </span>
                      )}
                    </div>
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
