import { useState } from "react";
import { Link } from "react-router-dom";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="d-none d-lg-flex col-lg-6 bg-neutral-20">
            <div className="d-flex h-100 w-100 justify-content-center align-items-center">
              <div className="px-5">
                <h1 className="fw-bold text-center">Welcome to the App 🚀</h1>
                <div>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                  <div>
                    <div>
                      <span className="ri-checkbox-circle-line me-1" />
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </div>
                    <div>
                      <span className="ri-checkbox-circle-line me-1" />
                      Tempore, voluptatum, quas, quia voluptate.
                    </div>
                    <div>
                      <span className="ri-checkbox-circle-line me-1" />
                      Asperiores, voluptatum, quas, quia voluptate.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-4 offset-lg-1 h-100">
            <div className="h-100 d-flex flex-column justify-content-center" style={{
              maxWidth: "460px",
              display: "block",
              margin: "0 auto",
            }}>
              <div className="mb-5">
                <h1 className="fw-bold text-center">Sign Up 👋</h1>
              </div>

              {error && <div className="alert alert-danger" role="alert">
                {error}
              </div>}

              <div className="mb-3 d-flex flex-column">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-lg btn-block mb-3"
                >
                  <i className="ri-google-fill me-2" />
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="btn btn-outline-dark btn-lg btn-block"
                >
                  <i className="ri-github-fill me-2" />
                  Continue with GitHub
                </button>
              </div>

              <div className="d-flex align-items-center mb-3">
                <hr className="flex-grow-1" />
                <div className="px-2 text-muted fs-xs">OR</div>
                <hr className="flex-grow-1" />
              </div>

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

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input type="password" className="form-control" id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="mb-3 btn btn-primary form-control btn-lg">
                  Sign Up
                </button>
              </form>

              <div>
                <p className="fs-sm text-center">
                  Already have an account? <Link to="/login" className="fw-bold">Log in</Link>
                </p>
              </div>

              <div className="mt-5">
                <p className="fs-xs text-center text-muted opacity-75">
                  By signing up, you agree to our <Link to="/terms" className="fw-bold">Terms of Service</Link> and <Link to="/privacy" className="fw-bold">Privacy Policy</Link>.
                </p>
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