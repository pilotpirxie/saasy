import { useState } from "react";
import { Link } from "react-router-dom";
import { ReCaptchaNote } from "../components/ReCaptchaNote.tsx";
import { SideLayout } from "../components/SideLayout.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";
import { AuthProviderButtons } from "../components/AuthProviderButtons.tsx";
import { HorizontalSplitter } from "../components/HorizontalSplitter.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { FormLink } from "../components/FormLink.tsx";
import { TermsNote } from "../components/TermsNote.tsx";

export function RegisterPage() {
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
    <SideLayout
      leftChildren={
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
      }

      rightChildren={
        <div>
          <div className="mb-5">
            <h1 className="fw-bold text-center">Sign Up 👋</h1>
          </div>

          <ErrorMessage message={error} />

          <AuthProviderButtons
            onGoogle={() => {}}
            onGitHub={() => {}}
          />

          <HorizontalSplitter label="or" />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <EmailInput
                label={"Email address"}
                value={email}
                onChange={setEmail}
                autoFocus
                required
              />
            </div>

            <div className="mb-3">
              <PasswordInput
                label={"Password"}
                value={password}
                onChange={setPassword}
                required
              />
              <div className="d-flex justify-content-end">
                <Link
                  className="fs-xs"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="mb-3 btn btn-primary form-control btn-lg"
            >
              Sign Up
            </button>
          </form>

          <FormLink
            label={"Already have an account?"}
            linkLabel={"Log in"}
            linkTo={"/login"}
          />

          <TermsNote />
          <ReCaptchaNote />
        </div>
      }
    />
  );
}