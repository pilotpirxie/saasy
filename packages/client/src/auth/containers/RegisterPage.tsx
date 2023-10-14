import { useState } from "react";
import { SideLayout } from "../components/SideLayout.tsx";
import { RegisterForm } from "../components/RegisterForm.tsx";
import useIsMobile from "../../shared/hooks/useIsMobile.ts";
import { CleanLayout } from "../components/CleanLayout.tsx";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      throw new Error("Not implemented");

      setError(null);
    } catch (err) {
      setError("Something went wrong");
    }
  };

  if (isMobile) {
    return <CleanLayout>
      <RegisterForm
        email={email}
        password={password}
        error={error}
        onSubmit={handleSubmit}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
      />
    </CleanLayout>;
  }

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
        <RegisterForm
          email={email}
          password={password}
          error={error}
          onSubmit={handleSubmit}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      }
    />
  );
}