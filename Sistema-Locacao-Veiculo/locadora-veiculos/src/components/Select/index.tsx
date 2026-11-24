

//Propriedades do Select
import type { ChangeEvent } from "react";

export interface Opcao {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  options: Opcao[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({ label, name, value, options, onChange}: SelectProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value=""></option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
