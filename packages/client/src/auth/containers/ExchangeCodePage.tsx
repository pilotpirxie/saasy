import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { exchangeAuthCode } from "../data/thunks/exchangeAuthCode.ts";

export function ExchangeCodePage() {
  const navigate = useNavigate();
  const sessionState = useAppSelector((state) => state.auth.session);
  const exchangeAuthCodeState = useAppSelector((state) => state.auth.exchangeAuthCode);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      navigate(`/auth/login?error=${error}`);
      return;
    }

    if (code) {
      dispatch(exchangeAuthCode({
        code
      }));
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (exchangeAuthCodeState.error) {
      navigate(`/auth/login?error=${exchangeAuthCodeState.error}`);
      return;
    }

    if (sessionState.signedIn) {
      navigate("/dashboard");
    }
  }, [exchangeAuthCodeState.error, navigate, sessionState.signedIn]);

  return null;
}