
import { useMemo, useState } from "react";
import AdsTable from "../components/AdsTable";
import AdForm from "../components/AdForm";

export default function AdsManagement({
  ads = [],
  loading = false,
  actions = {},
  onUpdate,
  error,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editingAd, setEditingAd] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const filteredAds = useMemo(() => {
    const term = search.trim().toLowerCase();

    return ads.filter((ad) => {
      const title = (ad.title || "").toLowerCase();
      const description = (ad.description || "").toLowerCase();

      const matchesSearch =
        title.includes(term) || description.includes(term);

      const matchesStatus =
        status === "all" || (ad.status || "active") === status;

      return matchesSearch && matchesStatus;
    });
  }, [ads, search, status]);

  function startEditing(ad) {
    setFormError("");
    setEditingAd(ad);
  }

  async function saveChanges(values) {
    if (!editingAd) return;

    const id = editingAd._id || editingAd.id;

    if (!id) {
      setFormError("Is ad ki ID nahi mili.");
      return;
    }

    if (typeof onUpdate !== "function") {
      setFormError("Update function available nahi hai.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await onUpdate(id, values);
      setEditingAd(null);
    } catch (err) {
      setFormError(err.message || "Ad update nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">CAMPAIGN LIBRARY</span>
          <h2>Ads Management</h2>
          <p>
            Search, filter and manage your saved advertisements.
          </p>
        </div>

        <span className="count-pill">
          {filteredAds.length} results
        </span>
      </div>

      {(formError || error) && (
        <div className="notice notice-error" role="alert">
          {formError || error}
        </div>
      )}

      {editingAd && (
        <section className="panel edit-panel">
          <AdForm
            initialAd={editingAd}
            onSubmit={saveChanges}
            onCancel={() => {
              setEditingAd(null);
              setFormError("");
            }}
            submitting={saving}
          />
        </section>
      )}

      <section className="panel">
        <div className="filter-toolbar">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or description..."
              aria-label="Search advertisements"
            />
          </label>

          <select
            className="filter-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter ads by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading ads...</div>
        ) : (
          <AdsTable
            ads={filteredAds}
            onEdit={startEditing}
            onDelete={actions.onDelete}
            onToggle={actions.onToggle}
          />
        )}
      </section>
    </div>
  );
}
