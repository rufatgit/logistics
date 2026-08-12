import { useEffect, useState } from "react";
import { getShipmentTracking } from "../../api/shipments";
import "./TrackingTimeline.css";

export default function TrackingTimeline({ shipmentId, refreshKey }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getShipmentTracking(shipmentId)
      .then(setUpdates)
      .catch(() => setError("Couldn't load tracking history."))
      .finally(() => setLoading(false));
  }, [shipmentId, refreshKey]);

  if (loading) return null;
  if (error) return <p className="auth-error">{error}</p>;
  if (updates.length === 0) return null;

  return (
    <div className="tracking-section">
      <span className="section-label">TRACKING</span>
      <div className="tracking-timeline">
        {updates.map((u, i) => (
          <div className="tracking-item" key={u.id ?? i}>
            <div className="tracking-dot" />
            <div className="tracking-content">
              <div className="tracking-row">
                <span className="tracking-status">
                  {u.status.replace("_", " ")}
                </span>
                <span className="tracking-time">
                  {new Date(u.created_at).toLocaleString()}
                </span>
              </div>
              {u.location && (
                <span className="tracking-location">{u.location}</span>
              )}
              {u.note && <p className="tracking-note">{u.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
