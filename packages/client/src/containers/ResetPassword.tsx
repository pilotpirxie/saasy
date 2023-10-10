import { useState } from "react";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      throw new Error("Not implemented");

      setError(null);
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <>
      <div className="container h-100">
        <div className="row h-100">
          <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-4 offset-lg-4 h-100">
            <div className="h-100 d-flex flex-column justify-content-center">
              <div className="mb-5">
                <h1 className="fw-bold text-center">Reset password 🫣</h1>
              </div>

              {error && <div className="alert alert-danger" role="alert">
                {error}
              </div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    aria-describedby="passwordHelp"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="mb-3 btn btn-primary form-control btn-lg">
                  Set new password
                </button>
              </form>

              <div>
                <p className="fs-sm text-center">
                  Don't want to change password? <a href="/login" className="fw-bold">Back to login</a>
                </p>
              </div>

              <div className="mt-5">
                <p className="fs-xs text-center text-muted opacity-75">
                  This page is protected by Google reCAPTCHA, and subject to the
                  Google Privacy Policy and Terms of service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}