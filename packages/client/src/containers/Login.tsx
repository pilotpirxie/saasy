import { FormEvent, useState } from "react";
import { login } from "../data/sessions/thunks.ts";
import { useAppDispatch, useAppSelector } from "../store.ts";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const sessionsState = useAppSelector((state) => state.sessions);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(login({
      email,
      password
    }));
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

              {sessionsState.error && <div className="alert alert-danger" role="alert">
                {sessionsState.error}
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
                    <a className="fs-xs" href="/forgot-password">Forgot password?</a>
                  </div>
                </div>

                <button type="submit" className="mb-3 btn btn-primary form-control btn-lg">
                  Log In
                </button>
              </form>

              <div>
                <p className="fs-sm text-center">
                  Don&apos;t have an account? <a href="/register" className="fw-bold">Create new account</a>
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