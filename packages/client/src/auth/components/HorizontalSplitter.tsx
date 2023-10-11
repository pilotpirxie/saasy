export const HorizontalSplitter = ({ label }: {label: string}) => <div className="d-flex align-items-center mb-3">
  <hr className="flex-grow-1"/>
  <div className="px-2 text-muted fs-xs">{label.toUpperCase()}</div>
  <hr className="flex-grow-1"/>
</div>;
