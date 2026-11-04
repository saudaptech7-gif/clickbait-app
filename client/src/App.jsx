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

// PUBLIC FEED
function PublicFeed({ user, onLogout }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPublicAds() {
      try {
        const records = await getAds();

        if (active) {
          setAds(Array.isArray(records) ? records : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load ads.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPublicAds();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Feed
      ads={ads}
      loading={loading}
      error={error}
      user={user}
      onLogout={onLogout}
    />
  );
}

// ADMIN DASHBOARD
function Dashboard({ token, onLogout }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  async function handleCreate(values) {
    try {
      await createAd(values, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to create ad.");
      throw err;
    }
  }

  async function handleUpdate(id, values) {
    try {
      await updateAd(id, values, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to update ad.");
      throw err;
    }
  }

  async function handleDelete(ad) {
    const confirmed = window.confirm(
      `Delete "${ad.title || "this advertisement"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteAd(ad._id || ad.id, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to delete the ad.");
    }
  }

  async function handleToggle(ad) {
    try {
      const status = ad.status === "paused" ? "active" : "paused";

      await updateAd(ad._id || ad.id, { status }, token);
      await loadAds();
    } catch (err) {
      setError(err.message || "Unable to update ad status.");
    }
  }

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

      <Sidebar open={sidebarOpen} />

      <div className="main-area">
        <Header
          onMenuClick={() => setSidebarOpen((current) => !current)}
          onLogout={onLogout}
        />

        <main className="main-content">
          <Routes>
            <Route
              index
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
              path="ads"
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
              path="create-ad"
              element={<CreateAd onCreate={handleCreate} />}
            />

            <Route
              path="bulk-upload"
              element={<BulkUpload onUpload={handleBulkUpload} />}
            />

            <Route
              path="analytics"
              element={<Analytics ads={ads} loading={loading} error={error} />}
            />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Clickbait Ads Platform</span>
          <span>Admin Workspace</span>
        </footer>
      </div>
    </div>
  );
}

// MAIN APP CONTENT
function AppContent() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [checkingAuth, setCheckingAuth] = useState(true);

  // RESTORE LOGIN SESSION
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

  // LOGIN NAVIGATION - ONLY HERE
  function handleLogin(result) {
    if (!result?.token || !result?.user) {
      throw new Error("Invalid login response.");
    }

    if (!["admin", "user"].includes(result.user.role)) {
      throw new Error("Invalid account role.");
    }

    localStorage.setItem("token", result.token);

    setUser(result.user);
    setToken(result.token);

    if (result.user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/user-panel", { replace: true });
    }
  }

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }

  if (checkingAuth) {
    return <div className="auth-page">Checking account...</div>;
  }

  return (
    <Routes>
      {/* PUBLIC FEED */}
      <Route
        path="/"
        element={<PublicFeed user={user} onLogout={handleLogout} />}
      />

      <Route path="/feed" element={<Navigate to="/" replace />} />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin" : "/user-panel"}
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
              to={user.role === "admin" ? "/admin" : "/user-panel"}
              replace
            />
          ) : (
            <Signup onLogin={handleLogin} />
          )
        }
      />

      {/* ADMIN LOGIN */}
      <Route
        path="/admin/login"
        element={
          user?.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : user?.role === "user" ? (
            <Navigate to="/user-panel" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      {/* USER PANEL */}
      <Route
        path="/user-panel"
        element={
          user?.role === "user" ? (
            <UserPanel user={user} onLogout={handleLogout} />
          ) : user?.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/*"
        element={
          user?.role === "admin" ? (
            <Dashboard token={token} onLogout={handleLogout} />
          ) : user?.role === "user" ? (
            <Navigate to="/user-panel" replace />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* UNKNOWN ROUTES */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
