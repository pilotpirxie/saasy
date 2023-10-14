import { PropsWithChildren, useEffect } from "react";
import { useAppSelector } from "../../store.ts";
import { useNavigate } from "react-router-dom";

export const RequiredAuth = ({ children }: PropsWithChildren) => {
  const sessionState = useAppSelector((state) => state.auth.session);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionState.signedIn) {
      navigate("/auth/login");
    }
  }, [navigate, sessionState.signedIn]);

  return sessionState.signedIn ? children : null;
};