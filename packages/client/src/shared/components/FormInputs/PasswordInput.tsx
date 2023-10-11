export const PasswordInput = ({
  label,
  value,
  onChange,
  autofocus,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autofocus?: boolean;
  required?: boolean;
}) => {
  return (<div>
    <label
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
      className="form-label"
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
    />
  </div>);
};