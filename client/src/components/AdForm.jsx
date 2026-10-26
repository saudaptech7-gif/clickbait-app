
import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  productUrl: "",
  dimensions: "",
  status: "active",
};

export default function AdForm({
  initialAd,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (initialAd) {
      setForm({
        title: initialAd.title || "",
        description: initialAd.description || "",
        imageUrl: initialAd.imageUrl || "",
        productUrl: initialAd.productUrl || "",
        dimensions: initialAd.dimensions || "",
        status: initialAd.status || "active",
      });
    } else {
      setForm({ ...emptyForm });
    }

    setSubmitError("");
  }, [initialAd]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const title = form.title.trim();
    const imageUrl = form.imageUrl.trim();
    const productUrl = form.productUrl.trim();

    if (!title) {
      setSubmitError("Ad title enter karo.");
      return;
    }

    try {
      const parsedUrl = new URL(imageUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setSubmitError("Image URL HTTP ya HTTPS honi chahiye.");
        return;
      }
    } catch {
      setSubmitError("Valid image URL enter karo.");
      return;
    }

    if (productUrl) {
      try {
        const parsedProductUrl = new URL(productUrl);

        if (
          !["http:", "https:"].includes(parsedProductUrl.protocol)
        ) {
          setSubmitError(
            "Product website URL HTTP ya HTTPS honi chahiye."
          );
          return;
        }
      } catch {
        setSubmitError("Valid product website URL enter karo.");
        return;
      }
    }

    if (typeof onSubmit !== "function") {
      setSubmitError("Form submit function available nahi hai.");
      return;
    }

    try {
      await onSubmit({
        title,
        description: form.description.trim(),
        imageUrl,
        productUrl,
        dimensions: form.dimensions.trim(),
        status: form.status,
      });
    } catch (error) {
      setSubmitError(
        error.message || "Advertisement save nahi ho saka."
      );
    }
  }

  const validImageUrl = (() => {
    try {
      const url = new URL(form.imageUrl.trim());
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  })();

  return (
    <form className="ad-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <h2>
            {initialAd
              ? "Edit advertisement"
              : "Advertisement details"}
          </h2>
          <p>Enter the information for your campaign.</p>
        </div>

        <span className="form-required">* Required</span>
      </div>

      {submitError && (
        <div className="notice notice-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="form-grid">
        <label className="form-field">
          <span>Ad title *</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Summer campaign"
            maxLength={160}
            required
          />
        </label>

        <label className="form-field">
          <span>Image dimensions</span>
          <input
            name="dimensions"
            value={form.dimensions}
            onChange={handleChange}
            placeholder="e.g. 1080x1920"
          />
        </label>

        <label className="form-field form-field-full">
          <span>Image URL *</span>
          <input
            type="url"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
          />
          <small>Use a public HTTP or HTTPS image URL.</small>
        </label>

        <label className="form-field form-field-full">
          <span>Product Website URL</span>
          <input
            type="url"
            name="productUrl"
            value={form.productUrl}
            onChange={handleChange}
            placeholder="https://example.com/product"
          />
          <small>
            Ad par click karne par ye website new tab mein khulegi.
          </small>
        </label>

        <label className="form-field form-field-full">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a short description..."
            rows={4}
          />
        </label>

        <label className="form-field">
          <span>Campaign status</span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </label>
      </div>

      {validImageUrl && (
        <div className="image-preview">
          <p>Image preview</p>
          <img
            src={form.imageUrl.trim()}
            alt="Advertisement preview"
            onError={(event) =>
              event.currentTarget.classList.add("image-hidden")
            }
            onLoad={(event) =>
              event.currentTarget.classList.remove("image-hidden")
            }
          />
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}

        <button
          className="button button-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : initialAd
              ? "Save changes"
              : "Create advertisement"}
        </button>
      </div>
    </form>
  );
}
