import "./TextInput.css";

export default function TextInput({ label, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input-field ${error ? "input-error" : ""}`}
        autoComplete="off"
        spellCheck="false"
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
