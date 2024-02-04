export const SelectInput = ({
  label,
  value,
  onChange,
  autofocus,
  required,
  disabled,
  items,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autofocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  items: {
    label: string;
    value: string;
  }[];
}) => {
  return (<div>
    <label
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
      className="form-label"
    >
      {label}
    </label>
    <select
      className="form-control"
      id={label.replaceAll(" ", "_").toLowerCase()}
      autoFocus={autofocus}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      value={value}
    >
      {items.map((item) => {
        return <option
          key={item.value}
          value={item.value}
        >{item.label}</option>;
      })}
    </select>
  </div>);
};