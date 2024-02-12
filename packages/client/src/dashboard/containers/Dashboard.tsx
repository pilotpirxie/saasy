import { Navbar } from "./Navbar.tsx";
import { Tile } from "../components/Tile/Tile.tsx";
import { PlusTile } from "../components/Tile/PlusTile.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { useAppDispatch } from "../../store.ts";
import {
  openNewProjectModal,
  openNewTeamModal,
  openTeamMembersModal,
  openUpdateTeamModal
} from "../data/dashboardSlice.ts";
import { useFetchTeamsQuery } from "../data/teamsService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";
import { NewTeamModal } from "./NewTeamModal.tsx";
import { UpdateTeamModal } from "./UpdateTeamModal.tsx";
import dayjs from "dayjs";
import { TeamMembersModal } from "./TeamMembersModal.tsx";

export const Dashboard = () => {
  const dispatch = useAppDispatch();

  const {
    data,
    isLoading,
    isError,
    error
  } = useFetchTeamsQuery();
  const teams = data;

  const handleShowNewProjectModalForTeam = (teamId: string) => {
    dispatch(openNewProjectModal(teamId));
  };

  const handleOpenNewTeamModal = () => {
    dispatch(openNewTeamModal());
  };

  const handleOpenUpdateTeamModal = (teamId: string) => {
    dispatch(openUpdateTeamModal(teamId));
  };

  const handleOpenTeamMembersModal = (teamId: string) => {
    dispatch(openTeamMembersModal(teamId));
  };

  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />
    <NewTeamModal />
    <UpdateTeamModal />
    <TeamMembersModal />

    <div className="container">
      <div className="row">
        <div className="col-12">
          {isLoading && <div>Loading...</div>}
          {isError && <ErrorMessage message={getErrorRTKQuery(error)}/>}

          <div className="mt-5 d-flex justify-content-between align-items-center">
            <h4>Your teams & projects</h4>
            <div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleOpenNewTeamModal}
              >
                <span className="me-1 ri-add-line"></span>
                Create new team
              </button>
            </div>
          </div>

          {teams && teams.map((team) => {
            return <div
              key={team.id}
            >
              <div className="mt-5 d-flex align-items-center flex-wrap">
                <h5 className="fw-bold me-2 mb-0">
                  {team.name}
                  {team.plan.name === "Free" && <div className="badge bg-primary-subtle text-primary ms-2">Free</div>}
                  {team.plan.name === "Professional" && <div className="badge bg-success-subtle text-success ms-2">Professional</div>}
                  {team.plan.name === "Enterprise" && <div className="badge bg-dark-subtle text-dark ms-2">Enterprise</div>}
                </h5>
                {team.deleteAfter && <div className="badge bg-danger">
                  <span className="ri-alarm-warning-line me-1"></span>
                  Will be deleted on {dayjs(team.deleteAfter).format("DD-MM-YYYY")}
                </div>}
                <div className="ms-sm-auto gap-2 d-flex flex-wrap">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => handleOpenTeamMembersModal(team.id)}
                    disabled={team.role !== "owner"}
                  >
                    <span className="ri-user-2-line me-1"></span>
                    Members
                  </button>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => handleOpenUpdateTeamModal(team.id)}
                    disabled={team.role !== "owner"}
                  >
                    <span className="ri-settings-3-line me-1"></span>
                    Settings
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={team.role !== "owner"}
                  >
                    <span className="me-1 ri-suitcase-2-line"></span>
                    Upgrade
                  </button>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {team.projects.map((project) => {
                  return <Tile
                    key={project.id}
                    name={project.name}
                    color="blue"
                  />;
                })}
                <PlusTile
                  onClick={
                    () => handleShowNewProjectModalForTeam(team.id)
                  }
                />
              </div>
            </div>;
          })}
          {(!teams || teams.length === 0) && !isLoading && !isError && <div>No teams found</div>}
        </div>
      </div>
    </div>
    <Footer/>
  </ScreenContainer>;
};