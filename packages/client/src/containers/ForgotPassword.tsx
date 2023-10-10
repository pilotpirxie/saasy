import { useState } from "react";
import { Link } from "react-router-dom";

export function ForgotPassword() {
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
                <h1 className="fw-bold text-center">Forgot password? 🔑</h1>
              </div>

              {error && <div className="alert alert-danger" role="alert">
                {error}
              </div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    aria-describedby="emailHelp"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="mb-3 btn btn-primary form-control btn-lg">
                  Send reset link
                </button>
              </form>

              <div>
                <p className="fs-sm text-center">
                  Remember your password? <Link to="/login" className="fw-bold">Back to login</Link>
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