
/* eslint-disable no-undef */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Overview from "./pages/Overview";
import AdsManagement from "./pages/AdsManagement";
import CreateAd from "./pages/CreateAd";
import BulkUpload from "./pages/BulkUpload";
import Analytics from "./pages/Analytics";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import UserPanel from "./user/UserPanel";

import {
  getAds,
  createAd,
  updateAd,
  deleteAd,
  uploadAdsFile,
  getCurrentUser,
} from "./services/api";

// =====================================
// ADMIN DASHBOARD
// =====================================

function Dashboard({ token }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load advertisements
  const loadAds = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const records = await getAds(token);

      setAds(Array.isArray(records) ? records : []);
    } catch (err) {
      setError(err.message || "Unable to load ads.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  // Create ad
  async function handleCreate(values) {
    try {
      await createAd(values, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to create ad.");
      throw err;
    }
  }

  // Update ad
  async function handleUpdate(id, values) {
    try {
      await updateAd(id, values, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to update ad.");
      throw err;
    }
  }

  // Delete ad
  async function handleDelete(ad) {
    const confirmed = window.confirm(
      `Delete "${ad.title || "this advertisement"}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteAd(ad._id || ad.id, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to delete the ad.");
    }
  }

  // Pause / Activate ad
  async function handleToggle(ad) {
    try {
      const status =
        ad.status === "paused" ? "active" : "paused";

      await updateAd(ad._id || ad.id, { status }, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to update ad status.");
    }
  }

  // Bulk upload
  async function handleBulkUpload(file) {
    try {
      const result = await uploadAdsFile(file, token);
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
              element={
                <CreateAd onCreate={handleCreate} />
              }
            />

            <Route
              path="/bulk-upload"
              element={
                <BulkUpload onUpload={handleBulkUpload} />
              }
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

// =====================================
// USER FEED
// =====================================

function UserFeed({ token }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUserAds() {
      try {
        const records = await getAds(token);

        if (active) {
          setAds(Array.isArray(records) ? records : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load ads.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUserAds();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <Feed
      ads={ads}
      loading={loading}
      error={error}
    />
  );
}

// =====================================
// MAIN APP CONTENT
// =====================================

function AppContent() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [checkingAuth, setCheckingAuth] = useState(true);

  // Restore login session
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!token) {
        if (active) {
          setUser(null);
          setCheckingAuth(false);
        }

        return;
      }

      try {
        const result = await getCurrentUser(token);
        const currentUser = result.user || result;

        if (!currentUser || !currentUser.role) {
          throw new Error("Invalid user session.");
        }

        if (active) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem("token");

        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    setCheckingAuth(true);
    restoreSession();

    return () => {
      active = false;
    };
  }, [token]);

  // Login
  function handleLogin(result) {
    if (!result?.token || !result?.user) {
      throw new Error("Invalid login response.");
    }

    localStorage.setItem("token", result.token);

    setUser(result.user);
    setToken(result.token);

    navigate(
      result.user.role === "admin"
        ? "/"
        : "/user-panel",
      { replace: true }
    );
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);

    navigate("/login", { replace: true });
  }

  // Wait for backend session verification
  if (checkingAuth) {
    return (
      <div className="auth-page">
        Checking account...
      </div>
    );
  }

  return (
    <Routes>
      {/* LOGIN */}

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/"
                  : "/user-panel"
              }
              replace
            />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      {/* SIGNUP */}

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/"
                  : "/user-panel"
              }
              replace
            />
          ) : (
            <Signup onLogin={handleLogin} />
          )
        }
      />

      {/* USER PANEL */}

      <Route
        path="/user-panel"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === "user" ? (
            <UserPanel
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* USER FEED */}

      <Route
        path="/feed"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === "user" ? (
            <UserFeed token={token} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ADMIN DASHBOARD */}

      <Route
        path="/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === "admin" ? (
            <Dashboard token={token} />
          ) : (
            <Navigate to="/user-panel" replace />
          )
        }
      />
    </Routes>
  );
}

// =====================================
// APP
// =====================================

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
