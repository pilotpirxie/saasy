import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { useRefreshMutation } from "../../auth/data/authService.ts";
import { initializeOnly } from "../../auth/data/sessionSlice.ts";

export const AppRoot = () => {
  const [refresh] = useRefreshMutation();
  const dispatch = useAppDispatch();

  const refreshToken = useAppSelector(
    (state) => state.session.refreshToken,
  );

  useEffect(() => {
    const refreshTokenFromLocalStorage = localStorage.getItem("refreshToken");

    if (refreshTokenFromLocalStorage) {
      refresh({
        refreshToken: refreshTokenFromLocalStorage,
      });
    } else {
      dispatch(initializeOnly());
    }
  }, [dispatch, refresh]);

  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        if (!refreshToken) {
          return;
        }

        refresh({
          refreshToken,
        });
      },
      1000 * 60 * 5,
    );

    return () => {
      clearInterval(refreshInterval);
    };
  }, [refresh, refreshToken]);
  return <Outlet />;
};
