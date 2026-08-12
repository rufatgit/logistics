import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard-links">
      <Link to="/admin/carriers" className="admin-dashboard-card">
        <span className="section-label">CARRIERS</span>
        <span className="admin-dashboard-card-title">
          Verify carrier profiles →
        </span>
      </Link>
    </div>
  );
}
