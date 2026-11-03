import { Link, NavLink } from "react-router-dom";

export default function UserNavbar({ user, onLogout }) {
  return (
    <nav className="user-navbar">
      <Link to="/user-panel" className="user-navbar-logo">
        <span className="user-logo-icon">✦</span>
        Clickbait<span>App</span>
      </Link>

      <div className="user-navbar-links">
        <NavLink
          to="/user-panel"
          end
          className={({ isActive }) =>
            isActive ? "user-nav-link active" : "user-nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/feed"
          className={({ isActive }) =>
            isActive ? "user-nav-link active" : "user-nav-link"
          }
        >
          Explore Ads
        </NavLink>
      </div>

      <div className="user-navbar-actions">
        <span className="user-navbar-name">
          {user?.name || "User"}
        </span>

        <button
          type="button"
          className="user-navbar-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}