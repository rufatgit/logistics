import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCarrierProfile, createCarrierProfile } from "../api/carrier";
import AppLayout from "../components/layout/AppLayout";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import "./ShipmentForm.css"; // reuses .shipment-form / .shipment-form-row
import "./CarrierProfileSetup.css";

export default function CarrierProfileSetup() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    description: "",
    vat_number: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyCarrierProfile()
      .then(setExistingProfile)
      .catch(() => {
        // 404 just means no profile yet — that's the expected case here
      })
      .finally(() => setChecking(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createCarrierProfile(form);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Couldn't create your carrier profile.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checking)
    return (
      <AppLayout>
        <div>Loading…</div>
      </AppLayout>
    );

  if (existingProfile) {
    return (
      <AppLayout>
        <span className="section-label">CARRIER PROFILE</span>
        <h1 className="page-heading">{existingProfile.company_name}</h1>
        <p className="empty-state">
          {existingProfile.is_verified
            ? "Your profile is verified — you can submit offers on open shipments."
            : "Your profile is pending verification. You'll be able to submit offers once an admin verifies your account."}
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <span className="section-label">SET UP YOUR COMPANY</span>
      <h1 className="page-heading">Carrier profile</h1>

      <form onSubmit={handleSubmit} className="shipment-form">
        <TextInput
          label="Company Name"
          value={form.company_name}
          onChange={(e) => update("company_name", e.target.value)}
          required
        />
        <TextInput
          label="Description (optional)"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
        <TextInput
          label="VAT Number (optional)"
          value={form.vat_number}
          onChange={(e) => update("vat_number", e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Profile →"}
        </Button>
      </form>
    </AppLayout>
  );
}
