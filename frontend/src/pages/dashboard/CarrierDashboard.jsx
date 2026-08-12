import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listShipments } from "../../api/shipments";
import "./CustomerDashboard.css"; // shares the same list styles

export default function CarrierDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // For carriers, GET /shipments already returns only PENDING (open) shipments — see your router
    listShipments()
      .then(setShipments)
      .catch(() => setError("Couldn't load the marketplace."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading marketplace…</div>;
  if (error) return <p className="auth-error">{error}</p>;

  return (
    <div>
      <div className="dashboard-header-row">
        <span className="section-label">OPEN SHIPMENTS</span>
      </div>

      {shipments.length === 0 ? (
        <p className="empty-state">
          No open shipments right now — check back soon.
        </p>
      ) : (
        <div className="shipment-list">
          {shipments.map((s) => (
            <Link to={`/shipments/${s.id}`} key={s.id} className="shipment-row">
              <div className="shipment-route">
                <span>{s.pickup_location}</span>
                <span className="shipment-arrow">→</span>
                <span>{s.delivery_location}</span>
              </div>
              <div className="shipment-meta">
                <span className="status-badge">{s.cargo_type}</span>
                <span className="shipment-price">{s.weight_kg} kg</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
