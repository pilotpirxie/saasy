import { Navbar } from "./Navbar.tsx";
import { Footer } from "../components/Footer.tsx";
import { ScreenContainer } from "../../shared/containers/ScreenContainer.tsx";
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useFetchInvitationsQuery
} from "../data/usersService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";
import dayjs from "dayjs";
import { NewProjectModal } from "./NewProjectModal.tsx";

export const Invitations = () => {
  const { data: invitations,
    isError,
    error,
    isLoading,
    isSuccess
  } = useFetchInvitationsQuery();

  const [
    declineInvitation,
    {
      isError: isDecliningInvitationError,
      error: declineInvitationError,
      reset: resetDeclineInvitation
    }
  ] = useDeclineInvitationMutation();

  const [
    acceptInvitation,
    {
      isError: isAcceptingInvitationError,
      error: acceptInvitationError,
      reset: resetAcceptInvitation
    }
  ] = useAcceptInvitationMutation();

  const resetAll = () => {
    resetDeclineInvitation();
    resetAcceptInvitation();
  };

  const handleAcceptInvitation = (invitationId: string) => {
    resetAll();
    acceptInvitation({ invitationId });
  };

  const handleDeclineInvitation = (invitationId: string) => {
    resetAll();
    declineInvitation({ invitationId });
  };

  return <ScreenContainer>
    <Navbar />
    <NewProjectModal />

    <div className="container">
      <div className="row">
        <div className="col-12">

          {isLoading && <div>Loading...</div>}
          {isError && <ErrorMessage message={getErrorRTKQuery(error)}/>}

          {(isDecliningInvitationError || isAcceptingInvitationError)
            && <ErrorMessage message={getErrorRTKQuery(declineInvitationError || acceptInvitationError)}/>}

          <div className="mt-5">
            <h4>Invitations</h4>
          </div>

          {isSuccess && invitations && invitations.length === 0 && <div>
            <p>No invitations</p>
          </div>}

          {isSuccess && invitations && invitations.length > 0 && <div className="list-group">
            {invitations?.map((invitation) => (
              <div
                key={invitation.id}
                className="list-group-item d-sm-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="d-flex align-items-center">
                    <span className="ri-mail-fill me-1"/>
                    <h5 className="mb-1">{invitation.team.name}</h5>
                  </div>
                  <div>
                    <small>Expires: {dayjs(invitation.expiresAt).format("DD-MM-YYYY")}</small>
                  </div>
                  <div>
                    <small>Role: {invitation.role}</small>
                  </div>
                </div>

                <div className="mt-2 gap-2 d-flex">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeclineInvitation(invitation.id)}
                  >
                    Decline
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAcceptInvitation(invitation.id)}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>}

        </div>
      </div>
    </div>
    <Footer/>
  </ScreenContainer>;
};