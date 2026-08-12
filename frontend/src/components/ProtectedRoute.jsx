import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// allowedRoles is optional — omit it to just require "logged in", any role
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // we'll style this properly later
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
