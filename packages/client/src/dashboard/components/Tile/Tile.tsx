import "./Tile.css";

export const Tile = ({ name, color }: {
  name: string
  color?: string
}) => {
  const backgroundColor = color || "#c3f8ff";

  return <div
    className="mb-2 card card-body tile text-white fw-bold d-flex justify-content-end p-3 border-0 bg-light shadow-sm"
    style={{
      background: `linear-gradient(120deg, rgba(0, 0, 0, 0.5), 5%, ${backgroundColor} 100%)`,
    }}
  >
    <span className="tile-name">{name}</span>
    <div className="fw-normal small">
      <div className="">Lorem ipsum dolor sit amet.</div>
      <div className="d-flex gap-2">
        <div>1240 <span className="ri-error-warning-line"></span></div>
        <div>1240 <span className="ri-alert-line"></span></div>
      </div>
    </div>

  </div>;
};