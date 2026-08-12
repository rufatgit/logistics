import { useEffect, useState } from "react";
import { listOffersForShipment, acceptOffer } from "../../api/offers";
import Button from "../ui/Button";
import "./OffersList.css";

export default function OffersList({ shipmentId, shipmentStatus, onAccepted }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listOffersForShipment(shipmentId)
      .then(setOffers)
      .catch(() => setError("Couldn't load offers."))
      .finally(() => setLoading(false));
  }, [shipmentId]);

  async function handleAccept(offerId) {
    setAcceptingId(offerId);
    try {
      await acceptOffer(offerId);
      onAccepted?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't accept this offer.");
    } finally {
      setAcceptingId(null);
    }
  }

  const canAccept = shipmentStatus === "pending" || shipmentStatus === "quoted";

  if (loading) return <div>Loading offers…</div>;
  if (error) return <p className="auth-error">{error}</p>;

  return (
    <div className="offers-section">
      <span className="section-label">OFFERS ({offers.length})</span>

      {offers.length === 0 ? (
        <p className="empty-state">No offers yet.</p>
      ) : (
        <div className="offers-list">
          {offers.map((o) => (
            <div className="offer-row" key={o.id}>
              <div className="offer-carrier">
                <span className="offer-carrier-name">
                  {o.carrier.company_name}
                </span>
                <span className="offer-carrier-rating">
                  {o.carrier.rating_count > 0
                    ? `★ ${o.carrier.rating_avg.toFixed(1)} (${o.carrier.rating_count})`
                    : "No ratings yet"}
                </span>
              </div>
              <div className="offer-details">
                <span>{o.truck_type}</span>
                <span>{o.delivery_days} days</span>
                <span>{o.insurance_included ? "Insured" : "No insurance"}</span>
              </div>
              <div className="offer-price-action">
                <span className="offer-price">${o.price}</span>
                {canAccept && o.status === "pending" && (
                  <Button
                    variant="secondary"
                    disabled={acceptingId === o.id}
                    onClick={() => handleAccept(o.id)}
                  >
                    {acceptingId === o.id ? "Accepting…" : "Accept"}
                  </Button>
                )}
                {o.status !== "pending" && (
                  <span className="status-badge">{o.status}</span>
                )}
              </div>
              {o.message && <p className="offer-message">{o.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
