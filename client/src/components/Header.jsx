
import { useLocation } from "react-router-dom";

const pageNames = {
  "/": "Overview",
  "/ads": "Ads Management",
  "/create-ad": "Create Ad",
  "/bulk-upload": "Bulk Upload",
  "/analytics": "Analytics",
  "/feed": "User Feed",
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const title = pageNames[location.pathname] || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
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
        <span className="admin-avatar">A</span>
        <div className="admin-details">
          <strong>Administrator</strong>
          <small>Campaign manager</small>
        </div>
      </div>
    </header>
  );
}
