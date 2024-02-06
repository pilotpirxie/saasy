import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { authService, useRefreshMutation } from "../../auth/data/authService.ts";

export const AppRoot = () => {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();

  const refreshToken = useAppSelector(
    (state) => state.session.refreshToken,
  );

  useEffect(() => {
    const refreshTokenFromLocalStorage = localStorage.getItem("refreshToken");

    if (refreshTokenFromLocalStorage) {
      dispatch(authService.endpoints?.refresh.initiate({
        refreshToken: refreshTokenFromLocalStorage
      }));
    }
  }, [dispatch]);

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
