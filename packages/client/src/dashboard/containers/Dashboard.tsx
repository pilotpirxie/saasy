import { useAppDispatch, useAppSelector } from "../../store.ts";
import { logoutThunk } from "../../auth/data/thunks/logoutThunk.ts";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const sessionState = useAppSelector((state) => state.auth.session);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (!sessionState.refreshToken) {
      return;
    }

    dispatch(logoutThunk({
      refreshToken: sessionState.refreshToken
    }));

    navigate("/auth/login");
  };

  return <div>
    <h1>Dashboard</h1>
    <button onClick={handleLogout}>Logout</button>
  </div>;
};