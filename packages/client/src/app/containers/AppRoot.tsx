import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { loginFromLocalStorageThunk } from "../../auth/data/thunks/loginFromLocalStorageThunk.ts";
import { refreshThunk } from "../../auth/data/thunks/refreshThunk.ts";

export const AppRoot = () => {
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector((state) => state.auth.session.refreshToken);

  useEffect(() => {
    dispatch(loginFromLocalStorageThunk({}));
  }, [dispatch]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!refreshToken) {
        return;
      }

      dispatch(refreshThunk({
        refreshToken
      }));
    }, 1000 * 60 * 5);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [dispatch, refreshToken]);
  return <Outlet />;
};