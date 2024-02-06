import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../store.ts";
import { useRefreshMutation } from "../../auth/data/authService.ts";

export const AppRoot = () => {
  const [refresh] = useRefreshMutation();

  const refreshToken = useAppSelector(
    (state) => state.session.refreshToken,
  );

  useEffect(() => {
    const refreshTokenFromLocalStorage = localStorage.getItem("refreshToken");

    if (refreshTokenFromLocalStorage) {
      refresh({
        refreshToken: refreshTokenFromLocalStorage,
      });
    }
  }, [refresh]);

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
