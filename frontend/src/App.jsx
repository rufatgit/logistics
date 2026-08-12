import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ShipmentDetail from "./pages/ShipmentDetail";
import ShipmentForm from "./pages/ShipmentForm";
import CarrierProfileSetup from "./pages/CarrierProfileSetup";
import AdminCarriers from "./pages/AdminCarriers";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipments/new"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <ShipmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipments/:id"
        element={
          <ProtectedRoute>
            <ShipmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carrier-profile"
        element={
          <ProtectedRoute allowedRoles={["carrier"]}>
            <CarrierProfileSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/carriers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCarriers />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
