import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LoginProviderHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      navigate(`/login?error=${error}`);
    }

    if (code) {
      // ...
    }
  }, [navigate]);

  return null;
}