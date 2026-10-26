
export default function AdsTable({
  ads = [],
  onEdit,
  onDelete,
  onToggle,
}) {
  if (!ads.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">▤</span>
        <h3>No ads found</h3>
        <p>Create an ad or upload a JSON/CSV file to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="ads-table">
        <thead>
          <tr>
            <th>ADVERTISEMENT</th>
            <th>STATUS</th>
            <th>IMPRESSIONS</th>
            <th>CLICKS</th>
            <th>CTR</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {ads.map((ad) => {
            const impressions = Number(ad.impressions) || 0;
            const clicks = Number(ad.clicks) || 0;
            const ctr = impressions
              ? ((clicks / impressions) * 100).toFixed(2)
              : "0.00";

            return (
              <tr key={ad._id || ad.id}>
                <td>
                  <div className="ad-identity">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || "Advertisement"}
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <div>
                      <strong>{ad.title || "Untitled ad"}</strong>
                      <small>{ad.dimensions || "Dimensions not specified"}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    className={`status-badge ${
                      ad.status === "paused" ? "status-paused" : "status-active"
                    }`}
                  >
                    {ad.status === "paused" ? "Paused" : "Active"}
                  </span>
                </td>

                <td>{impressions.toLocaleString()}</td>
                <td>{clicks.toLocaleString()}</td>
                <td>{ctr}%</td>

                <td>
                  <div className="table-actions">
                    <button
                      className="action-button"
                      onClick={() => onEdit(ad)}
                    >
                      Edit
                    </button>

                    <button
                      className="action-button"
                      onClick={() => onToggle(ad)}
                    >
                      {ad.status === "paused" ? "Activate" : "Pause"}
                    </button>

                    <button
                      className="action-button action-delete"
                      onClick={() => onDelete(ad)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
