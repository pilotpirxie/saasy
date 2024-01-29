import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import config from "../../../config.ts";
import { verifyEmail } from "../data/api/verifyEmail.ts";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      setUrlError(error);
    }

    const locationState = location.state as { email?: string; password?: string; justRegistered?: boolean; };

    if (locationState?.email) {
      setEmail(locationState.email);
    }

    if (locationState?.password) {
      setPassword(locationState.password);
    }

    if (locationState?.justRegistered) {
      setJustRegistered(locationState.justRegistered);
    }
  }, [location.state]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTotpError(null);
    setEmailVerifyError(null);
    setShowVerifyEmail(false);
    setLoginError(null);
    setJustRegistered(false);

    try {
      const loginResponse = await loginByEmail({
        email,
        password,
        totp,
      });

      window.location.href = loginResponse.redirectUrl;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "TotpCodeRequired") {
          setShowTotpInput(true);
          return;
        }

        if (err.message === "EmailNotVerified") {
          setShowVerifyEmail(true);
          return;
        }

        setLoginError(err.message);
      } else {
        setLoginError("An error occurred");
      }
    }
  };

  const handleSubmitVerifyEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEmailVerifyError(null);

    try {
      await verifyEmail({ email, code: verificationCode });

      handleSubmit(e);
    } catch (err) {
      if (err instanceof Error) {
        setEmailVerifyError(err.message);
      } else {
        setEmailVerifyError("An error occurred");
      }
    }
  };

  return (
    <CleanLayout>
      <div className="mb-5">
        <h1 className="fw-bold text-center">Log In 🔐</h1>
      </div>

      <ErrorMessage message={emailVerifyError || totpError || loginError || urlError} />

      {justRegistered && !showTotpInput && !showVerifyEmail && !loginError && <div className="mb-3">
        <div
          className="alert alert-success"
          role="alert"
        >
          You have successfully registered. Please log in.
        </div>
      </div>}

      {showVerifyEmail && !showTotpInput && !loginError && !emailVerifyError && <div className="mb-3">
        <p className="alert alert-info">
          We have sent you an email with a verification code. Please enter the code below.
        </p>
      </div>}

      {!showVerifyEmail && <div>
        <AuthProviderButtons
          onGoogle={() => window.location.href = config.baseUrl + "/api/auth/google"}
          onGitHub={() => window.location.href = config.baseUrl + "/api/auth/github"}
        />

        <HorizontalSplitter label="or"/>
      </div>}

      {!showVerifyEmail && <form onSubmit={handleSubmit}>
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
          className="mb-3 btn btn-primary w-100 btn-lg"
        >
          Log In
        </button>
      </form>}

      {showVerifyEmail && <form onSubmit={handleSubmitVerifyEmail}>
        <div className="mb-3">
          <TextInput
            label={"Verification code"}
            value={verificationCode}
            onChange={setVerificationCode}
            required
          />
        </div>

        <button
          type="submit"
          className="mb-3 btn btn-primary w-100 btn-lg"
        >
          Verify Email
        </button>
      </form>}

      <FormLink
        label={"Don't have an account?"}
        linkLabel={"Sign Up"}
        linkTo={"/auth/register"}
      />

      <ReCaptchaNote/>
    </CleanLayout>
  );
}