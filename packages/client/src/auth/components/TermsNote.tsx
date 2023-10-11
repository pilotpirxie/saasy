import { Link } from "react-router-dom";

export const TermsNote = () => <div className="mt-5">
  <p className="fs-xs text-center text-muted opacity-75">
    By continuing, you agree to our <Link
      to="/terms"
      className="fw-bold"
    >Terms of Service</Link> and <Link
      to="/privacy"
      className="fw-bold"
    >Privacy Policy</Link>.
  </p>
</div>;
