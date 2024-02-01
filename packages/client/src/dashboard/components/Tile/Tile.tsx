import "./Tile.css";

export const Tile = ({ name, color }: {
  name: string
  color?: string
}) => {
  const backgroundColor = color || "#c3f8ff";

  return <div
    className="mb-2 card card-body tile text-white fw-bold d-flex justify-content-end p-3 border-0"
    style={{
      background: `linear-gradient(120deg, rgba(0, 0, 0, 0.5), 5%, ${backgroundColor} 100%)`
    }}
  >
    <span className='tile-name'>{name}</span>
  </div>;
};