import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { loginFromLocalStorage } from "../../auth/data/thunks/loginFromLocalStorage.ts";
import { refreshAuthCode } from "../../auth/data/thunks/refreshAuthCode.ts";

export const AppRoot = () => {
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector((state) => state.auth.session.refreshToken);

  useEffect(() => {
    dispatch(loginFromLocalStorage({}));
  }, [dispatch]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!refreshToken) {
        return;
      }

      dispatch(refreshAuthCode({
        refreshToken
      }));
    }, 1000 * 60 * 5);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [dispatch, refreshToken]);
  return <Outlet />;
};