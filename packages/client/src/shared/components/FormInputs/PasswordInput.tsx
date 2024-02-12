export const PasswordInput = ({
  label,
  value,
  onChange,
  autofocus,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autofocus?: boolean;
  required?: boolean;
  minLength?: number;
}) => {
  return (<div>
    <label
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
      className="form-label mt-2 mb-0"
    >
      {label}
    </label>
    <input
      type="password"
      className="form-control"
      id={label.replaceAll(" ", "_").toLowerCase()}
      autoFocus={autofocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      minLength={minLength ?? 8}
    />
  </div>);
};