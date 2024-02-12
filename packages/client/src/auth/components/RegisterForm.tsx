import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { AuthProviderButtons } from "./AuthProviderButtons.tsx";
import { HorizontalSplitter } from "./HorizontalSplitter.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { FormLink } from "./FormLink.tsx";
import { TermsNote } from "./TermsNote.tsx";
import { ReCaptchaNote } from "./ReCaptchaNote.tsx";
import config from "../../../config.ts";

export const RegisterForm = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  error,
  onSubmit,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return <>
    <div className="mb-5">
      <h1 className="fw-bold text-center">Sign Up 👋</h1>
    </div>

    <ErrorMessage message={error} />

    <AuthProviderButtons
      onGoogle={() => window.location.href = config.baseUrl + "/api/auth/google"}
      onGitHub={() => window.location.href = config.baseUrl + "/api/auth/github"}
    />

    <HorizontalSplitter label="or" />

    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <EmailInput
          label="Email address"
          value={email}
          onChange={onEmailChange}
          autoFocus
          required
        />
      </div>

      <div className="mb-3">
        <PasswordInput
          label="Password"
          value={password}
          onChange={onPasswordChange}
          required
        />
      </div>

      <button
        type="submit"
        className="mb-3 btn btn-primary w-100 btn-lg"
      >
        Sign Up
      </button>
    </form>

    <FormLink
      label="Already have an account?"
      linkLabel="Log in"
      linkTo="/auth/login"
    />

    <TermsNote />
    <ReCaptchaNote />
  </>;
};