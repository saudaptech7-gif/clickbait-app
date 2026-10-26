
import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./pages/Overview";
import AdsManagement from "./pages/AdsManagement";
import CreateAd from "./pages/CreateAd";
import BulkUpload from "./pages/BulkUpload";
import Analytics from "./pages/Analytics";
import Feed from "./pages/Feed";

import {
  getAds,
  createAd,
  updateAd,
  deleteAd,
  uploadAdsFile,
} from "./services/api";

function Dashboard() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const loadAds = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const records = await getAds();
      setAds(records);
    } catch (err) {
      setError(err.message || "Unable to load ads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  async function handleCreate(values) {
    try {
      await createAd(values);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to create ad.");
      throw err;
    }
  }

  async function handleUpdate(id, values) {
    try {
      await updateAd(id, values);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to update ad.");
      throw err;
    }
  }

  async function handleDelete(ad) {
    const confirmed = window.confirm(
      `Delete "${ad.title || "this advertisement"}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteAd(ad._id || ad.id);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to delete the ad.");
    }
  }

  async function handleToggle(ad) {
    try {
      const status =
        ad.status === "paused" ? "active" : "paused";

      await updateAd(ad._id || ad.id, { status });
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to update ad status.");
    }
  }

  async function handleBulkUpload(file) {
    try {
      const result = await uploadAdsFile(file);
      await loadAds();
      return result;
    } catch (err) {
      setError(err.message || "Unable to upload ads.");
      throw err;
    }
  }

  const actions = {
    onDelete: handleDelete,
    onToggle: handleToggle,
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="main-area">
        <Header
          onMenuClick={() =>
            setSidebarOpen((current) => !current)
          }
        />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Overview
                  ads={ads}
                  loading={loading}
                  error={error}
                  actions={actions}
                />
              }
            />

            <Route
              path="/ads"
              element={
                <AdsManagement
                  ads={ads}
                  loading={loading}
                  error={error}
                  actions={actions}
                  onUpdate={handleUpdate}
                />
              }
            />

            <Route
              path="/create-ad"
              element={<CreateAd onCreate={handleCreate} />}
            />

            <Route
              path="/bulk-upload"
              element={<BulkUpload onUpload={handleBulkUpload} />}
            />

            <Route
              path="/analytics"
              element={
                <Analytics
                  ads={ads}
                  loading={loading}
                  error={error}
                />
              }
            />

            <Route
              path="/feed"
              element={
                <Feed
                  ads={ads}
                  loading={loading}
                  error={error}
                />
              }
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <span>
            © {new Date().getFullYear()} Clickbait Ads Platform
          </span>
          <span>Admin Workspace</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}
