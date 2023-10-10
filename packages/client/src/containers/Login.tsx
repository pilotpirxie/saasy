import { FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store.ts";
import { login } from "../data/auth/thunks/login.ts";
import { checkTotpStatus } from "../data/auth/api/checkTotpStatus.ts";
import { getErrorMessage } from "../data/utils/errorMessages.ts";
import { Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      setTotpError(null);
      e.preventDefault();

      const totpStatus = await checkTotpStatus({ email });

      if (totpStatus.enabled && !totp) {
        setShowTotpInput(true);
        return;
      }

      await dispatch(login({
        email,
        password,
        totp,
      }));
    } catch (err) {
      if (err instanceof Error) {
        setTotpError(err.message);
      }
    }
  };

  return (
    <>
      <div className="container h-100">
        <div className="row h-100">
          <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-4 offset-lg-4 h-100">
            <div className="h-100 d-flex flex-column justify-content-center">
              <div className="mb-5">
                <h1 className="fw-bold text-center">Log In 🔐</h1>
              </div>

              {(totpError || authState.login.error) && <div className="alert alert-danger" role="alert">
                {getErrorMessage(totpError || authState.login.error)}
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
                  />
                  <div className="d-flex justify-content-end">
                    <Link className="fs-xs" to="/forgot-password">Forgot password?</Link>
                  </div>
                </div>

                {showTotpInput && <div className="mb-3">
                  <label htmlFor="totp" className="form-label">
                    Two-factor code
                  </label>
                  <input type="text" className="form-control" id="totp"
                    value={totp}
                    onChange={(e) => setTotp(e.target.value)}
                    required
                  />
                </div>}

                <button type="submit" className="mb-3 btn btn-primary form-control btn-lg">
                  Log In
                </button>
              </form>

              <div>
                <p className="fs-sm text-center">
                  Don't have an account? <Link to="/register" className="fw-bold">Create new account</Link>
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