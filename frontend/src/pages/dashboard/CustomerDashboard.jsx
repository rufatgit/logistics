import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listShipments } from "../../api/shipments";
import Button from "../../components/ui/Button";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listShipments()
      .then(setShipments)
      .catch(() => setError("Couldn't load your shipments."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading shipments…</div>;
  if (error) return <p className="auth-error">{error}</p>;

  return (
    <div>
      <div className="dashboard-header-row">
        <span className="section-label">YOUR SHIPMENTS</span>
        <Link to="/shipments/new">
          <Button>New Shipment →</Button>
        </Link>
      </div>

      {shipments.length === 0 ? (
        <p className="empty-state">You haven't created any shipments yet.</p>
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
                <span className="status-badge">
                  {s.status.replace("_", " ")}
                </span>
                <span className="shipment-price">
                  {s.estimated_price ? `$${s.estimated_price}` : "—"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
