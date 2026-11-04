import { useLocation, useNavigate } from "react-router-dom";

const pageNames = {
  "/admin": "Overview",
  "/admin/ads": "Ads Management",
  "/admin/create-ad": "Create Ad",
  "/admin/bulk-upload": "Bulk Upload",
  "/admin/analytics": "Analytics",
};

export default function Header({ onMenuClick, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const title = pageNames[location.pathname] || "Dashboard";

  function handlePublicFeed() {
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <div>
          <p className="breadcrumb">Workspace / {title}</p>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="public-feed-button"
          onClick={handlePublicFeed}
        >
          View Public Feed
        </button>

        <span className="admin-avatar">A</span>

        <div className="admin-details">
          <strong>Administrator</strong>
          <small>Campaign manager</small>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
