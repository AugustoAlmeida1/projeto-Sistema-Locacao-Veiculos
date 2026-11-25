

//Propriedades do textarea
import type { ChangeEvent } from "react";

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  error?: string;
}

export function TextArea({ label, name, value, onChange, rows = 3, error}: TextAreaProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`form-control${error ? " is-invalid" : ""}`}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

