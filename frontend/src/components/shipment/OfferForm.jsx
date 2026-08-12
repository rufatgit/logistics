import { useState } from "react";
import { submitOffer } from "../../api/offers";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";
import "./OfferForm.css";

export default function OfferForm({ shipmentId, onSubmitted }) {
  const [form, setForm] = useState({
    price: "",
    delivery_days: "",
    truck_type: "",
    insurance_included: false,
    message: "",
  });
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
      await submitOffer(shipmentId, {
        ...form,
        price: parseFloat(form.price),
        delivery_days: parseInt(form.delivery_days, 10),
      });
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't submit your offer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="offer-form">
      <span className="section-label">SUBMIT AN OFFER</span>

      <div className="offer-form-row">
        <TextInput
          label="Price ($)"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          required
        />
        <TextInput
          label="Delivery Days"
          type="number"
          min="1"
          value={form.delivery_days}
          onChange={(e) => update("delivery_days", e.target.value)}
          required
        />
      </div>

      <TextInput
        label="Truck Type"
        value={form.truck_type}
        onChange={(e) => update("truck_type", e.target.value)}
        required
      />

      <label className="offer-checkbox">
        <input
          type="checkbox"
          checked={form.insurance_included}
          onChange={(e) => update("insurance_included", e.target.checked)}
        />
        Insurance included
      </label>

      <TextInput
        label="Message (optional)"
        value={form.message}
        onChange={(e) => update("message", e.target.value)}
      />

      {error && <p className="auth-error">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Offer →"}
      </Button>
    </form>
  );
}
