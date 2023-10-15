import { FormEvent, useEffect, useState } from "react";
import { checkTotpStatus } from "../data/api/checkTotpStatus.ts";
import { Link } from "react-router-dom";
import { CleanLayout } from "../components/CleanLayout.tsx";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { AuthProviderButtons } from "../components/AuthProviderButtons.tsx";
import { HorizontalSplitter } from "../components/HorizontalSplitter.tsx";
import { ReCaptchaNote } from "../components/ReCaptchaNote.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { FormLink } from "../components/FormLink.tsx";
import { loginByEmail } from "../data/api/loginByEmail.ts";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      setUrlError(error);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTotpError(null);

    try {
      const totpStatus = await checkTotpStatus({ email });
      if (totpStatus.enabled && !totp) {
        setShowTotpInput(true);
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        setTotpError(err.message);
      } else {
        setTotpError("An error occurred");
      }
    }

    try {
      const loginResponse = await loginByEmail({
        email,
        password,
        totp,
      });

      window.location.href = loginResponse.redirectUrl;
    } catch (err) {
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError("An error occurred");
      }
    }
  };

  return (
    <CleanLayout>
      <div className="mb-5">
        <h1 className="fw-bold text-center">Log In 🔐</h1>
      </div>

      {loginError === "EmailNotVerified" ? <div
        className="alert alert-danger"
        role="alert"
      >
        Your email address has not been verified. Please check your email.
        <br />
        <Link
          className="alert-link small"
          to={"/auth/resend"}
        >Resend email</Link>
      </div> : <ErrorMessage message={totpError || loginError || urlError} />}

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
              to="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {showTotpInput && <div className="mb-3">
          <TextInput
            label={"Two-factor code"}
            value={totp}
            onChange={setTotp}
            required
          />
        </div>}

        <button
          type="submit"
          className="mb-3 btn btn-primary form-control btn-lg"
        >
          Log In
        </button>
      </form>

      <FormLink
        label={"Don't have an account?"}
        linkLabel={"Sign Up"}
        linkTo={"/auth/register"}
      />

      <ReCaptchaNote />
    </CleanLayout>
  );
}