import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import CustomerDashboard from "./dashboard/CustomerDashboard";
import CarrierDashboard from "./dashboard/CarrierDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <AppLayout>
      <span className="section-label">DASHBOARD</span>
      <h1 className="page-heading">
        Welcome back, {currentUser?.full_name?.split(" ")[0]}
      </h1>

      {currentUser?.role === "customer" && <CustomerDashboard />}
      {currentUser?.role === "carrier" && <CarrierDashboard />}
      {currentUser?.role === "admin" && <AdminDashboard />}
    </AppLayout>
  );
}
