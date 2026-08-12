import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <span className="section-label">404</span>
      <h1 className="page-heading">Page not found</h1>
      <p className="empty-state">The page you're looking for doesn't exist.</p>
      <Link to="/" className="not-found-link">
        Back to dashboard →
      </Link>
    </div>
  );
}
