import { useState } from "react";
import { CleanLayout } from "../components/CleanLayout.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";
import { ReCaptchaNote } from "../components/ReCaptchaNote.tsx";
import { EmailInput } from "../../shared/components/FormInputs/EmailInput.tsx";
import { FormLink } from "../components/FormLink.tsx";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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
    <CleanLayout>
      <div className="mb-5">
        <h1 className="fw-bold text-center">Forgot password? 🔑</h1>
      </div>

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
          className="mb-3 btn btn-primary form-control btn-lg"
        >
          Send reset link
        </button>
      </form>

      <FormLink
        label="Remember your password?"
        linkLabel={"Back to login"}
        linkTo={"/auth/login"}
      />

      <ReCaptchaNote />
    </CleanLayout>
  );
}