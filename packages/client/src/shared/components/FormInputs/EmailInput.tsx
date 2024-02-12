export const EmailInput = ({
  label,
  value,
  onChange,
  autoFocus,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
}) => {
  return (<div>
    <label
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
      className="form-label mt-2 mb-0"
    >
      {label}
    </label>
    <input
      type="email"
      className="form-control"
      id={label.replaceAll(" ", "_").toLowerCase()}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    />
  </div>);
};