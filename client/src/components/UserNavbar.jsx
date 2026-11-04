import { Link } from "react-router-dom";

export default function UserNavbar({ user, onLogout }) {
  return (
    <nav className="user-navbar">
      <div className="user-navbar-container">
        <Link to="/" className="user-navbar-logo">
          <span className="user-logo-icon">✦</span>
          Clickbait<span>App</span>
        </Link>

        <div className="user-navbar-actions">
          <Link to="/" className="user-nav-btn feed-btn">
            Feed
          </Link>

          {user ? (
            <button
              type="button"
              className="user-nav-btn logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="user-nav-btn login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
