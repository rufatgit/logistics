import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getShipment } from "../api/shipments";
import AppLayout from "../components/layout/AppLayout";
import OffersList from "../components/shipment/OffersList";
import OfferForm from "../components/shipment/OfferForm";
import TrackingTimeline from "../components/shipment/TrackingTimeline";
import StatusUpdateControl from "../components/shipment/StatusUpdateControl";
import "./ShipmentDetail.css";

export default function ShipmentDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasOffered, setHasOffered] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchShipment = useCallback(() => {
    return getShipment(id)
      .then(setShipment)
      .catch(() => setError("Couldn't load this shipment."));
  }, [id]);

  useEffect(() => {
    fetchShipment().finally(() => setLoading(false));
  }, [fetchShipment]);

  function handleUpdated() {
    fetchShipment();
    setRefreshKey((k) => k + 1);
  }

  if (loading)
    return (
      <AppLayout>
        <div>Loading…</div>
      </AppLayout>
    );
  if (error)
    return (
      <AppLayout>
        <p className="auth-error">{error}</p>
      </AppLayout>
    );
  if (!shipment) return null;

  const isOwner =
    currentUser?.role === "customer" && shipment.customer_id === currentUser.id;
  const isCarrier = currentUser?.role === "carrier";
  const shipmentIsOpen =
    shipment.status === "pending" || shipment.status === "quoted";
  // Backend enforces who's actually allowed to advance status (owner, assigned carrier, or admin) —
  // we show the control to both owner and any carrier once booked, and let a 403 surface as an error
  // if this particular carrier isn't the assigned one.
  const canSeeStatusControl =
    (isOwner || isCarrier || currentUser?.role === "admin") &&
    ["booked", "in_transit"].includes(shipment.status);

  return (
    <AppLayout>
      <span className="section-label">SHIPMENT #{shipment.id}</span>
      <h1 className="page-heading">
        {shipment.pickup_location} <span className="heading-arrow">→</span>{" "}
        {shipment.delivery_location}
      </h1>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-section">
            <span className="section-label">CARGO</span>
            <div className="detail-fact-row">
              <span>Type</span>
              <span>{shipment.cargo_type}</span>
            </div>
            <div className="detail-fact-row">
              <span>Weight</span>
              <span>{shipment.weight_kg} kg</span>
            </div>
            {shipment.volume_m3 && (
              <div className="detail-fact-row">
                <span>Volume</span>
                <span>{shipment.volume_m3} m³</span>
              </div>
            )}
            {shipment.dimensions && (
              <div className="detail-fact-row">
                <span>Dimensions</span>
                <span>{shipment.dimensions}</span>
              </div>
            )}
            <div className="detail-fact-row">
              <span>Pickup Date</span>
              <span>{shipment.pickup_date}</span>
            </div>
            {shipment.special_requirements && (
              <div className="detail-fact-row">
                <span>Special Requirements</span>
                <span>{shipment.special_requirements}</span>
              </div>
            )}
          </div>

          {isOwner && (
            <OffersList
              shipmentId={shipment.id}
              shipmentStatus={shipment.status}
              onAccepted={handleUpdated}
            />
          )}

          {isCarrier && shipmentIsOpen && !hasOffered && (
            <OfferForm
              shipmentId={shipment.id}
              onSubmitted={() => setHasOffered(true)}
            />
          )}
          {isCarrier && hasOffered && (
            <p className="empty-state">Your offer has been submitted.</p>
          )}

          {canSeeStatusControl && (
            <StatusUpdateControl
              shipment={shipment}
              onUpdated={handleUpdated}
            />
          )}

          <TrackingTimeline shipmentId={shipment.id} refreshKey={refreshKey} />
        </div>

        <div className="detail-sidebar">
          <span className="status-badge">
            {shipment.status.replace("_", " ")}
          </span>
          {shipment.estimated_price && (
            <div className="detail-price">
              <span className="section-label">EST. PRICE</span>
              <span className="detail-price-value">
                ${shipment.estimated_price}
              </span>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
