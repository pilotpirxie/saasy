import { useAppSelector } from "../../store.ts";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar.tsx";
import { Tile } from "../components/Tile/Tile.tsx";
import { PlusTile } from "../components/Tile/PlusTile.tsx";
import { NewProjectModal } from "../components/NewProjectModal.tsx";
import { useState } from "react";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { useLogoutMutation } from "../../auth/data/authService.ts";

export const Dashboard = () => {
  const sessionState = useAppSelector((state) => state.session);
  const navigate = useNavigate();
  const [showNewProjectModalForTeam, setShowNewProjectModalForTeam] = useState<string | null>(null);
  const [logout] = useLogoutMutation();

  const teams = [{
    id: 1,
    name: "XantesS's Team",
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

  const handleLogout = async () => {
    if (!sessionState.refreshToken) {
      return;
    }

    await logout({
      refreshToken: sessionState.refreshToken
    });

    navigate("/auth/login");
  };

  return <ScreenContainer>
    <Navbar
      onLogout={handleLogout}
      onNewProject={() => setShowNewProjectModalForTeam(teams[0].id.toString())}
    />
    <NewProjectModal
      show={!!showNewProjectModalForTeam}
      onClose={() => setShowNewProjectModalForTeam(null)}
      teams={[
        { id: "1", name: "Team 1" },
        { id: "2", name: "Team 2" },
        { id: "3", name: "Team 3" }
      ]}
      initialTeamId={showNewProjectModalForTeam || ""}
      onCreate={(teamId, name, color) => {
        console.info("Creating project", teamId, name, color);
      }}
    />
    <div className="container">
      <div className="row">
        <div className="col-12">
          {teams.map((team) => {
            return <div
              key={team.id}
            >
              <div className="mt-5 d-flex align-items-center flex-wrap">
                <h5 className='fw-bold me-2'>{team.name}</h5>
                <div className='ms-sm-auto gap-2 d-flex flex-wrap'>
                  <button
                    className="btn btn-sm btn-light"
                  >
                    <span className="ri-user-2-line me-1"></span>
                    Members
                  </button>
                  <button
                    className="btn btn-sm btn-light"
                  >
                    <span className="ri-settings-3-line me-1"></span>
                    Settings
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                  >
                    <span className="me-1 ri-suitcase-2-line"></span>
                    Upgrade
                  </button>
                </div>
              </div>
              <div className='d-flex flex-wrap gap-2 mt-2'>
                {team.projects.map((project) => {
                  return <Tile
                    key={project.id}
                    name={project.name}
                    color={project.color}
                  />;
                })}
                <PlusTile
                  onClick={
                    () => setShowNewProjectModalForTeam(team.id.toString())
                  }
                />
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
    <Footer />
  </ScreenContainer>;
};