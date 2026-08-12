import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShipment } from "../api/shipments";
import AppLayout from "../components/layout/AppLayout";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import "./ShipmentForm.css";

const initialForm = {
  pickup_location: "",
  delivery_location: "",
  cargo_type: "",
  weight_kg: "",
  volume_m3: "",
  dimensions: "",
  pickup_date: "",
  special_requirements: "",
};

export default function ShipmentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        weight_kg: parseFloat(form.weight_kg),
        volume_m3: form.volume_m3 ? parseFloat(form.volume_m3) : null,
        photo_urls: [],
      };
      const shipment = await createShipment(payload);
      navigate(`/shipments/${shipment.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't create shipment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <span className="section-label">NEW SHIPMENT</span>
      <h1 className="page-heading">Ship something</h1>

      <form onSubmit={handleSubmit} className="shipment-form">
        <div className="shipment-form-section">
          <span className="section-label">ROUTE</span>
          <div className="shipment-form-row">
            <TextInput
              label="Pickup Location"
              value={form.pickup_location}
              onChange={(e) => update("pickup_location", e.target.value)}
              required
            />
            <TextInput
              label="Delivery Location"
              value={form.delivery_location}
              onChange={(e) => update("delivery_location", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="shipment-form-section">
          <span className="section-label">CARGO</span>
          <div className="shipment-form-row">
            <TextInput
              label="Cargo Type"
              value={form.cargo_type}
              onChange={(e) => update("cargo_type", e.target.value)}
              required
            />
            <TextInput
              label="Weight (kg)"
              type="number"
              min="0"
              step="0.1"
              value={form.weight_kg}
              onChange={(e) => update("weight_kg", e.target.value)}
              required
            />
          </div>
          <div className="shipment-form-row">
            <TextInput
              label="Volume (m³, optional)"
              type="number"
              min="0"
              step="0.1"
              value={form.volume_m3}
              onChange={(e) => update("volume_m3", e.target.value)}
            />
            <TextInput
              label="Dimensions (optional)"
              placeholder="120x80x100 cm"
              value={form.dimensions}
              onChange={(e) => update("dimensions", e.target.value)}
            />
          </div>
        </div>

        <div className="shipment-form-section">
          <span className="section-label">SCHEDULE</span>
          <TextInput
            label="Pickup Date"
            type="date"
            value={form.pickup_date}
            onChange={(e) => update("pickup_date", e.target.value)}
            required
          />
          <TextInput
            label="Special Requirements (optional)"
            value={form.special_requirements}
            onChange={(e) => update("special_requirements", e.target.value)}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Shipment →"}
        </Button>
      </form>
    </AppLayout>
  );
}
