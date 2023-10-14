import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { AuthProviderButtons } from "./AuthProviderButtons.tsx";
import { HorizontalSplitter } from "./HorizontalSplitter.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { FormLink } from "./FormLink.tsx";
import { TermsNote } from "./TermsNote.tsx";
import { ReCaptchaNote } from "./ReCaptchaNote.tsx";
import { Link } from "react-router-dom";

export const RegisterForm = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  error,
  registered,
  onSubmit,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  error: string | null;
  registered: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return <>
    <div className="mb-5">
      <h1 className="fw-bold text-center">Sign Up 👋</h1>
    </div>

    {registered ? <div
      className="alert alert-success"
      role="alert"
    >
      You have been registered! Please check your email to verify your account.
      <br />
      <Link
        className="alert-link small"
        to={"/auth/resend"}
      >Resend email</Link>
    </div>
      : null}
    <ErrorMessage message={error} />

    <AuthProviderButtons
      onGoogle={() => {}}
      onGitHub={() => {}}
    />

    <HorizontalSplitter label="or" />

    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <EmailInput
          label={"Email address"}
          value={email}
          onChange={onEmailChange}
          autoFocus
          required
        />
      </div>

      <div className="mb-3">
        <PasswordInput
          label={"Password"}
          value={password}
          onChange={onPasswordChange}
          required
        />
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
      linkTo={"/auth/login"}
    />

    <TermsNote />
    <ReCaptchaNote />
  </>;
};