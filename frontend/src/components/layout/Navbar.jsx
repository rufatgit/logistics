import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        FREIGHT
      </Link>

      <nav className="navbar-links">
        <Link to="/">Dashboard</Link>
        {currentUser?.role === "customer" && (
          <Link to="/shipments/new">Ship Something</Link>
        )}
        {currentUser?.role === "carrier" && (
          <Link to="/carrier-profile">Company Profile</Link>
        )}
        {currentUser?.role === "admin" && (
          <Link to="/admin/carriers">Verify Carriers</Link>
        )}
      </nav>

      <div className="navbar-actions">
        <span className="navbar-user">{currentUser?.full_name}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}
