import { FormEvent, useState } from "react";
import { CleanLayout } from "../components/CleanLayout.tsx";
import { ReCaptchaNote } from "../components/ReCaptchaNote.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { FormLink } from "../components/FormLink.tsx";
import { resendVerify } from "../data/api/resendVerify.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";

export function ResendVerify() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError(null);
      setSent(false);

      await resendVerify({ email });

      setSent(true);
      setError(null);
      setEmail("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    }
  };

  return (
    <CleanLayout>
      <div className="mb-5">
        <h1 className="fw-bold text-center">
          Send new verification email 📧
        </h1>
      </div>

      {sent && (
        <div
          className="alert alert-success"
          role="alert"
        >
          Verification email sent. Please check your inbox.
        </div>
      )}

      <ErrorMessage message={error} />

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

        <button
          type="submit"
          className="mb-3 btn btn-primary w-100 btn-lg"
        >
          Send new verification email
        </button>
      </form>

      <FormLink
        label={"Don't want to resend verification email?"}
        linkLabel={"Back to login"}
        linkTo={"/auth/login"}
      />

      <ReCaptchaNote />
    </CleanLayout>
  );
}