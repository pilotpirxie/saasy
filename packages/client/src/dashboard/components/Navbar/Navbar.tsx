import "./Navbar.css";

export const Navbar = ({
  onLogout,
}: {
  onLogout: () => void;
}) => {
  return <nav className="navbar bg-dark navbar-expand-sm">
    <div className="container-fluid">
      <a
        className="navbar-brand text-white fw-bold"
        href="#"
      >App Name</a>
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
            <a
              className="nav-link text-white"
              aria-current="page"
              href="#"
            >Projects</a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link text-white"
              href="#"
            >Teams</a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link text-white active"
              href="#"
            >Documentation</a>
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
                src="https://picsum.photos/200/200"
                alt="Logo"
                width="24"
                height="24"
                className="d-inline-block align-text-top rounded-circle"
              />

              <div className="d-block d-sm-none ms-1 text-white">Profile</div>
            </div>
            <ul className="dropdown-menu dropdown-menu-sm-end">
              <li><a
                className="dropdown-item"
                href="#"
              >Settings</a></li>
              <li><a
                className="dropdown-item"
                href="#"
              >Help</a></li>
              <li><a
                className="dropdown-item"
                onClick={onLogout}
              >Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>;
};