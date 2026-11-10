import { Link } from "react-router-dom";

export default function UserNavbar() {
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
        </div>
      </div>
    </nav>
  );
}
