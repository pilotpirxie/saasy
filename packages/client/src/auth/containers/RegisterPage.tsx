import { useState } from "react";
import { SideLayout } from "../components/SideLayout.tsx";
import { RegisterForm } from "../components/RegisterForm.tsx";
import useIsMobile from "../../shared/hooks/useIsMobile.ts";
import { CleanLayout } from "../components/CleanLayout.tsx";
import { registerByEmail } from "../api/registerByEmail.ts";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isMobile = useIsMobile();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setRegisterError(null);

    try {
      await registerByEmail({
        email,
        password,
      });

      navigate("/auth/login", {
        state: {
          email: email,
          password: password,
          justRegistered: true,
        }
      });
    } catch (err) {
      if (err instanceof Error) {
        setRegisterError(err.message);
      } else {
        setRegisterError("An error occurred");
      }
    }
  };

  if (isMobile) {
    return <CleanLayout>
      <RegisterForm
        email={email}
        password={password}
        error={registerError}
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
          error={registerError}
          onSubmit={handleSubmit}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      }
    />
  );
}