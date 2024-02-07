import { Navbar } from "./Navbar.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import { NewProjectModal } from "./NewProjectModal.tsx";
import { Footer } from "../components/Footer.tsx";
import { useFetchTeamsQuery } from "../data/teamsService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";
import dayjs from "dayjs";

export const Teams = () => {
  const {
    data,
    isLoading,
    isError,
    error
  } = useFetchTeamsQuery();
  const teams = data;

  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />

    <div className="container">
      <div className="row">
        <div className="col-12">
          {isLoading && <div>Loading...</div>}
          {isError && <ErrorMessage message={getErrorRTKQuery(error)}/>}

          <ul className="list-group mt-5">
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
                  {team.deleteAfter && <div className='badge bg-danger'>
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