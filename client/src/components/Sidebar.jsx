import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview", icon: "◫", end: true },
  { to: "/admin/ads", label: "Ads Management", icon: "▤" },
  { to: "/admin/create-ad", label: "Create Ad", icon: "＋" },
  { to: "/admin/bulk-upload", label: "Bulk Upload", icon: "⇧" },
  { to: "/admin/analytics", label: "Analytics", icon: "▥" },
  { to: "/", label: "Public Feed", icon: "▷", end: true },
];

export default function Sidebar({ open }) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <NavLink to="/admin" end className="brand">
        <span className="brand-mark">C</span>
        <span>
          Clickbait<span className="brand-dot">.</span>
        </span>
      </NavLink>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>

            {link.to === "/admin/ads" && <span className="nav-arrow">›</span>}
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
