import { useEffect, useState, useCallback } from "react";
import { listCarriers, verifyCarrier } from "../api/carrier";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import "./AdminCarriers.css";

export default function AdminCarriers() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    return listCarriers()
      .then(setCarriers)
      .catch(() => setError("Couldn't load carriers."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleVerify(id) {
    setVerifyingId(id);
    try {
      await verifyCarrier(id);
      refresh();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't verify this carrier.");
    } finally {
      setVerifyingId(null);
    }
  }

  if (loading)
    return (
      <AppLayout>
        <div className="loading-state">Loading carriers…</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <span className="section-label">ADMIN</span>
      <h1 className="page-heading">Carrier verification</h1>

      {error && <p className="auth-error">{error}</p>}

      {carriers.length === 0 ? (
        <p className="empty-state">No carrier profiles yet.</p>
      ) : (
        <div className="admin-carrier-list">
          {carriers.map((c) => (
            <div className="admin-carrier-row" key={c.id}>
              <div className="admin-carrier-info">
                <span className="admin-carrier-name">{c.company_name}</span>
                {c.vat_number && (
                  <span className="admin-carrier-vat">VAT {c.vat_number}</span>
                )}
              </div>
              <div className="admin-carrier-action">
                {c.is_verified ? (
                  <span className="status-badge">verified</span>
                ) : (
                  <Button
                    variant="secondary"
                    disabled={verifyingId === c.id}
                    onClick={() => handleVerify(c.id)}
                  >
                    {verifyingId === c.id ? "Verifying…" : "Verify →"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
