import { useState } from "react";
import { updateShipmentStatus } from "../../api/shipments";
import Button from "../ui/Button";
import "./StatusUpdateControl.css";

// Mirrors your backend's ShipmentStatus enum progression
const NEXT_STATUS = {
  booked: "in_transit",
  in_transit: "delivered",
};

const NEXT_LABEL = {
  in_transit: "Mark In Transit",
  delivered: "Mark Delivered",
};

export default function StatusUpdateControl({ shipment, onUpdated }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nextStatus = NEXT_STATUS[shipment.status];
  if (!nextStatus) return null; // nothing left to advance to (or not yet booked)

  async function handleAdvance() {
    setSubmitting(true);
    setError("");
    try {
      await updateShipmentStatus(shipment.id, {
        status: nextStatus,
        note: note || undefined,
      });
      setNote("");
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update status.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="status-control">
      <input
        className="status-note-input"
        placeholder="Optional note…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button variant="secondary" onClick={handleAdvance} disabled={submitting}>
        {submitting ? "Updating…" : `${NEXT_LABEL[nextStatus]} →`}
      </Button>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
