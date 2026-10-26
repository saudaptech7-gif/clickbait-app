
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview", icon: "◫", end: true },
  { to: "/ads", label: "Ads Management", icon: "▤" },
  { to: "/create-ad", label: "Create Ad", icon: "＋" },
  { to: "/bulk-upload", label: "Bulk Upload", icon: "⇧" },
  { to: "/analytics", label: "Analytics", icon: "▥" },
  { to: "/feed", label: "User Feed", icon: "▷" },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <NavLink to="/" className="brand" onClick={onNavigate}>
        <span className="brand-mark">C</span>
        <span>Clickbait<span className="brand-dot">.</span></span>
      </NavLink>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
            {link.to === "/ads" && (
              <span className="nav-arrow">›</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span className="status-dot" />
          <div>
            <strong>Admin Workspace</strong>
            <small>Campaign management</small>
          </div>
        </div>
        <p>Clickbait Ads Platform</p>
      </div>
    </aside>
  );
}
