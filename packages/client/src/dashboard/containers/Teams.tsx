import { Navbar } from "./Navbar.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import { Footer } from "../components/Footer.tsx";
import { useFetchTeamsQuery } from "../data/teamsService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";
import dayjs from "dayjs";
import { NewTeamModal } from "./NewTeamModal.tsx";
import { useAppDispatch } from "../../store.ts";
import { openNewTeamModal, openUpdateTeamModal } from "../data/dashboardSlice.ts";
import { UpdateTeamModal } from "./UpdateTeamModal.tsx";

export const Teams = () => {
  const {
    data: teams,
    isLoading,
    isError,
    error
  } = useFetchTeamsQuery();
  const dispatch = useAppDispatch();

  const handleOpenNewTeamModal = () => {
    dispatch(openNewTeamModal());
  };

  const handleOpenUpdateTeamModal = (teamId: string) => {
    dispatch(openUpdateTeamModal(teamId));
  };

  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />
    <NewTeamModal />
    <UpdateTeamModal />

    <div className="container">
      <div className="row">
        <div className="col-12">
          {isLoading && <div>Loading...</div>}
          {isError && <ErrorMessage message={getErrorRTKQuery(error)}/>}

          <div className="mt-5 d-flex justify-content-between align-items-center">
            <h4>Your teams</h4>
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

          <ul className="list-group mt-3">
            {teams && teams.map((team) => {
              return <li
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
                key={team.id}
              >
                <div>
                  <b>
                    {team.name}
                  </b>
                  <div>
                    Created on {dayjs(team.createdAt).format("DD-MM-YYYY")}
                  </div>
                  <div>
                    Role in team:
                    {team.role === "owner" && <span className="badge bg-primary ms-1">Owner</span>}
                    {team.role === "member" && <span className="badge bg-info ms-1">Member</span>}
                  </div>
                  {team.deleteAfter && <div className="badge bg-danger">
                    Scheduled for deletion on {dayjs(team.deleteAfter).format("DD-MM-YYYY")}
                  </div>}
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-light"
                  >
                    <span className="ri-user-2-line me-1"></span>
                    Members
                  </button>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => handleOpenUpdateTeamModal(team.id)}
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
              </li>;
            })}
          </ul>
        </div>
      </div>
    </div>

    <Footer />
  </ScreenContainer>;
};