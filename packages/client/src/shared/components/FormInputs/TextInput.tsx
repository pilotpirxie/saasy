export const TextInput = ({
  label,
  value,
  onChange,
  autofocus,
  required,
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autofocus?: boolean;
  required?: boolean;
  disabled?: boolean;
}) => {
  return (<div>
    <label
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
      className="form-label"
    >
      {label}
    </label>
    <input
      type="text"
      className="form-control"
      id={label.replaceAll(" ", "_").toLowerCase()}
      autoFocus={autofocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    />
  </div>);
};