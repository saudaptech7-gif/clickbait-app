import { Link } from "react-router-dom";

export default function UserPanel({ user, onLogout }) {
  return (
    <main className="user-panel-page">
      <div className="user-dashboard">
        <header className="user-dashboard-header">
          <Link to="/user-panel" className="user-logo">
            Clickbait App
          </Link>

          <div className="user-header-actions">
            <span className="user-name">{user?.name || "User"}</span>

            <button onClick={onLogout} className="user-logout-btn">
              Logout
            </button>
          </div>
        </header>

        <section className="user-welcome">
          <div>
            <p className="user-greeting">USER DASHBOARD</p>
            <h1>Welcome, {user?.name || "User"}!</h1>
            <p>Explore advertisements and discover something interesting.</p>
          </div>
        </section>

        <section className="user-stats-grid">
          <div className="user-stat-card">
            <div className="user-stat-icon">👤</div>
            <h3>My Account</h3>
            <p>{user?.name || "User"}</p>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon">✉️</div>
            <h3>Email Address</h3>
            <p>{user?.email || "Not available"}</p>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon">⭐</div>
            <h3>Account Type</h3>
            <p>Regular User</p>
          </div>
        </section>

        <section className="user-explore-section">
          <div className="user-explore-content">
            <div>
              <p className="user-greeting">DISCOVER MORE</p>
              <h2>Explore Advertisements</h2>
              <p>Browse available advertisements and explore their details.</p>
            </div>

            <Link to="/feed" className="user-explore-btn">
              Explore Ads <span>→</span>
            </Link>
          </div>
        </section>

        <section className="user-account-section">
          <h2>Account Information</h2>

          <div className="user-account-row">
            <span>Full Name</span>
            <strong>{user?.name || "Not available"}</strong>
          </div>

          <div className="user-account-row">
            <span>Email</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>

          <div className="user-account-row">
            <span>Account Role</span>
            <strong>User</strong>
          </div>
        </section>

        <footer className="user-dashboard-footer">
          © {new Date().getFullYear()} Clickbait App
        </footer>
      </div>
    </main>
  );
}
