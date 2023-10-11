export const AuthProviderButtons = ({
  onGoogle,
  onGitHub
}: {
  onGoogle: () => void;
  onGitHub: () => void;
}) => <div className="mb-3 d-flex flex-column">
  <button
    type="button"
    className="btn btn-outline-danger btn-lg btn-block mb-3"
    onClick={onGoogle}
  >
    <i className="ri-google-fill me-2"/> Continue with Google
  </button>

  <button
    type="button"
    className="btn btn-outline-dark btn-lg btn-block"
    onClick={onGitHub}
  >
    <i className="ri-github-fill me-2"/> Continue with GitHub
  </button>
</div>;
