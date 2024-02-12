import { PropsWithChildren, useEffect } from "react";
import { useAppSelector } from "../../store.ts";
import { useNavigate } from "react-router-dom";

export const RequiredAuth = ({ children }: PropsWithChildren) => {
  const sessionState = useAppSelector((state) => state.session);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionState.signedIn && sessionState.isInitialized) {
      navigate("/auth/login");
    }
  }, [navigate, sessionState.isInitialized, sessionState.signedIn]);

  return sessionState.signedIn ? children : null;
};