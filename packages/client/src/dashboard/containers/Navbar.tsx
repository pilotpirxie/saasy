import { Link, useNavigate } from "react-router-dom";
import { useFetchProfileQuery } from "../data/userService.ts";
import { useLogoutMutation } from "../../auth/data/authService.ts";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { openNewProjectModal } from "../data/dashboardSlice.ts";

export const Navbar = () => {
  const { data } = useFetchProfileQuery();
  const [logout] = useLogoutMutation();
  const sessionState = useAppSelector((state) => state.session);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    if (!sessionState.refreshToken) {
      return;
    }

    await logout({
      refreshToken: sessionState.refreshToken
    });

    navigate("/auth/login");
  };

  const onNewProject = () => {
    dispatch(openNewProjectModal());
  };

  return <nav className="navbar bg-light-subtle navbar-expand-sm border-bottom">
    <div className="container">
      <div className="d-flex">
        <Link
          to="/dashboard"
          className="navbar-brand fw-bold"
        >App Name</Link>

        <button
          className="btn btn-sm btn-primary d-flex d-sm-none align-items-center m-auto"
          type="button"
          onClick={onNewProject}
        >
          <span className="ri-add-line me-1"></span>
          <div>
            New project
          </div>
        </button>
      </div>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarText"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className="collapse navbar-collapse"
        id="navbarText"
      >
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link
              className="nav-link active"
              to="/dashboard"
            >Projects</Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/teams"
            >Teams</Link>
          </li>

          <li className="nav-item align-items-center d-none d-sm-flex">
            <button
              className="btn btn-sm btn-primary d-flex align-items-center"
              type="button"
              onClick={onNewProject}
            >
              <span className="ri-add-line"></span>
              <div className="d-none d-md-block ms-1">
                New project
              </div>
            </button>
          </li>

        </ul>
        <ul className="navbar-nav">
          <li className="nav-item dropdown">
            <div
              className="nav-link dropdown-toggle d-flex align-items-center"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={data?.avatarUrl || "https://picsum.photos/200/200"}
                alt="Logo"
                width="24"
                height="24"
                className="d-inline-block align-text-top rounded-circle"
              />
              <div className="d-block d-sm-none ms-1">Profile</div>
              <div className="ms-1">Profile</div>
            </div>
            <ul className="dropdown-menu dropdown-menu-sm-end">
              <li><Link
                className="dropdown-item"
                to="/account"
              >Settings</Link></li>
              <li><Link
                className="dropdown-item"
                to="/help"
              >Help</Link></li>
              <li><div
                className="dropdown-item cursor-pointer"
                onClick={handleLogout}
              >Logout</div></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>;
};