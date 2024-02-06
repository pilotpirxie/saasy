import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store.ts";
import { useExchangeAuthCodeMutation } from "../data/authService.ts";

export function ExchangeCodePage() {
  const navigate = useNavigate();
  const sessionState = useAppSelector((state) => state.session);
  const [exchangeAuthCode, { isSuccess, isError, error }] = useExchangeAuthCodeMutation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryCode = urlParams.get("code");
    const queryError = urlParams.get("error");

    if (error) {
      navigate(`/auth/login?error=${queryError}`);
      return;
    }

    if (queryCode) {
      exchangeAuthCode({
        code: queryCode,
      });
    }
  }, [exchangeAuthCode, navigate, error]);

  useEffect(() => {
    if (isError) {
      navigate(`/auth/login?error=${error}`);
      return;
    }

    if (sessionState.signedIn || isSuccess) {
      navigate("/dashboard");
    }
  }, [isError, isSuccess, navigate, sessionState.signedIn, error]);

  return null;
}