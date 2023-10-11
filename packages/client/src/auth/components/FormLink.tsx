import { Link } from "react-router-dom";

export const FormLink = ({ label, linkLabel, linkTo } : {
  label: string;
  linkLabel: string;
  linkTo: string;
}) => {
  return <div className="fs-sm text-center">
    {label}{" "}
    <Link
      to={linkTo}
      className="fw-bold"
    >
      {linkLabel}
    </Link>
  </div>;
};