export const CheckboxInput = ({
  label,
  value,
  onChange,
  autofocus,
  required,
  disabled
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  autofocus?: boolean;
  required?: boolean;
  disabled?: boolean;
}) => {
  return (<div className="form-check">
    <input
      className="form-check-input cursor-pointer"
      type="checkbox"
      id={label.replaceAll(" ", "_").toLowerCase()}
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      autoFocus={autofocus}
      required={required}
      disabled={disabled}
    />
    <label
      className="form-check-label cursor-pointer"
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
    >
      {label}
    </label>
  </div>);
};