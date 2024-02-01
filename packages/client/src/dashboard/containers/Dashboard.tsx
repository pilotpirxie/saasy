import { useAppDispatch, useAppSelector } from "../../store.ts";
import { logoutThunk } from "../../auth/data/thunks/logoutThunk.ts";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar.tsx";
import { Tile } from "../components/Tile/Tile.tsx";

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const sessionState = useAppSelector((state) => state.auth.session);
  const navigate = useNavigate();

  const teams = [{
    id: 1,
    name: "Team 1",
    membersCount: 2,
    projects: [{
      id: 1,
      name: "Project 1",
    }, {
      id: 2,
      name: "Project 2",
      color: "#2dc927"
    }]
  }, {
    id: 2,
    name: "Team 2",
    membersCount: 2,
    projects: [{
      id: 3,
      name: "Project 3",
      color: "#1ffe53"
    }, {
      id: 4,
      name: "Project 4",
      color: "#1fb0fe"
    }, {
      id: 7,
      name: "Project 7",
      color: "#fe1fa5"
    }]
  }, {
    id: 3,
    name: "Team 3",
    membersCount: 2,
    projects: [{
      id: 5,
      name: "Super long project name that is very long and has a lot of text in it and is very long",
      color: "#ffa300"
    }, {
      id: 6,
      name: "Project 6",
      color: "#fe1f5a"
    }]
  }];

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
    <Navbar onLogout={handleLogout} />
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {teams.map((team) => {
            return <div
              key={team.id}
            >
              <h5 className='mt-5 fw-bold'>{team.name}</h5>
              <div className='d-flex flex-wrap gap-2'>
                {team.projects.map((project) => {
                  return <Tile
                    key={project.id}
                    name={project.name}
                    color={project.color}
                  />;
                })}
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </div>;
};