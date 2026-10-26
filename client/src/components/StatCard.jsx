
export default function StatCard({
  title,
  value,
  icon,
  description,
  accent = "purple",
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon stat-${accent}`}>{icon}</span>
        <span className="stat-period">All time</span>
      </div>

      <p className="stat-label">{title}</p>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-description">{description}</p>
    </article>
  );
}
