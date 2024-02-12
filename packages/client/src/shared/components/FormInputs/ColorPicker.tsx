const PREDEFINED_COLORS = [
  "#ff5976",
  "#ff8554",
  "#ae50ff",
  "#65ff65",
  "#59cfff",
  "#DC143C",
  "#D2691E",
];

export const ColorPicker = ({
  label,
  value,
  onChange,
  allowCustomColor,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowCustomColor?: boolean;
}) => {
  return <div>
    <label
      htmlFor={label.replaceAll(" ", "_").toLowerCase()}
      className="form-label mt-2 mb-0"
    >
      {label}
    </label>

    <div className="d-flex flex-wrap justify-content-around align-items-center">
      {PREDEFINED_COLORS.map((color) => {
        return <button
          key={color}
          className={`btn p-0 ${value === color ? "opacity-50" : ""}`}
          style={{
            backgroundColor: color,
            width: "40px",
            height: "40px",
            margin: "2px",
          }}
          onClick={() => onChange(color)}
        >
          {value === color && <span className="ri-check-line text-white fs-4"></span>}
        </button>;
      })}

      {allowCustomColor && <input
        className="btn p-0"
        style={{
          width: "40px",
          height: "40px",
          border: "1px solid #000",
          margin: "2px",
        }}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />}
    </div>
  </div>;
};
