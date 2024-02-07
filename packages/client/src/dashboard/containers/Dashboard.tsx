import { Navbar } from "./Navbar.tsx";
import { Tile } from "../components/Tile/Tile.tsx";
import { PlusTile } from "../components/Tile/PlusTile.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { useAppDispatch } from "../../store.ts";
import { openNewProjectModal } from "../data/dashboardSlice.ts";
import { useFetchTeamsQuery } from "../data/teamsService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";

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

  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />
    <div className="container">
      <div className="row">
        <div className="col-12">
          {isLoading && <div>Loading...</div>}
          {isError && <ErrorMessage message={getErrorRTKQuery(error)} />}
          {teams && teams.map((team) => {
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
                    color={"blue"}
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
    <Footer />
  </ScreenContainer>;
};