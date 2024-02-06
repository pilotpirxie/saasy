import { FormEvent, useState } from "react";
import { CleanLayout } from "../components/CleanLayout.tsx";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { ReCaptchaNote } from "../components/ReCaptchaNote.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { FormLink } from "../components/FormLink.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { PasswordInput } from "../../shared/components/FormInputs/PasswordInput.tsx";
import { sendResetCode } from "../api/sendResetCode.ts";
import { checkResetCode } from "../api/checkResetCode.ts";
import { resetPassword } from "../api/resetPassword.ts";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordResetStep, setPasswordResetStep] = useState(0);
  const [newPassword, setNewPassword] = useState("");

  const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError(null);

      await sendResetCode({ email });

      setPasswordResetStep(1);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError(null);

      await checkResetCode({ email, code: verificationCode });

      setPasswordResetStep(2);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await resetPassword({ email, code: verificationCode, newPassword });

    setPasswordResetStep(3);
    try {
      setError(null);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <CleanLayout>
      <div className="mb-5">
        <h1 className="fw-bold text-center">Forgot password? 🔑</h1>
      </div>

      <ErrorMessage message={error} />

      {passwordResetStep === 0 && <form onSubmit={handleSendCode}>
        <div className="mb-3">
          <EmailInput
            label={"Email address"}
            value={email}
            onChange={setEmail}
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          className="mb-3 btn btn-primary w-100 btn-lg"
        >
          Reset password
        </button>
      </form>}

      {passwordResetStep === 1 && <form onSubmit={handleVerifyCode}>

        {!error && <div className="mb-3">
          <p className="alert alert-info">
            We have sent you an email with a verification code. Please enter the code below.
          </p>
        </div>}

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
          Continue
        </button>
      </form>}

      {passwordResetStep === 2 && <form onSubmit={handleResetPassword}>
        <div className="mb-3">
          <PasswordInput
            label={"New password"}
            value={newPassword}
            onChange={setNewPassword}
            required
          />
        </div>

        <button
          type="submit"
          className="mb-3 btn btn-primary w-100 btn-lg"
        >
          Set new password
        </button>
      </form>}

      {passwordResetStep === 3 && <div
        className="alert alert-success"
        role="alert"
      >
        Password has been reset. You can now <a href="/auth/login">login</a>.
      </div>}

      <FormLink
        label="Remember your password?"
        linkLabel={"Back to login"}
        linkTo={"/auth/login"}
      />

      <ReCaptchaNote />
    </CleanLayout>
  );
}