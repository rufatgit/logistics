import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import "./Login.css"; // shares the same auth layout styles

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    role: "customer",
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
      await register(form);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-label">GET STARTED</span>
        <h1 className="auth-heading">Create account</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <TextInput
            label="Full Name"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            required
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <TextInput
            label="Phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <TextInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />

          <div className="input-group">
            <label className="input-label">I am a</label>
            <select
              className="input-field"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="carrier">Carrier</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account →"}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
