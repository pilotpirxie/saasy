import { useState } from "react";
import { Modal } from "../components/Modal/Modal.tsx";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import {
  useCancelInvitationMutation,
  useFetchInvitedUsersQuery,
  useFetchTeamMembersQuery,
  useFetchTeamsQuery,
  useInviteUserToTeamMutation,
  useRevokeTeamMemberRoleMutation,
  useUpdateTeamMemberRoleMutation
} from "../data/teamsService.ts";
import { closeTeamMembersModal } from "../data/dashboardSlice.ts";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { RoleBadge } from "../components/RoleBadge.tsx";
import { SelectInput } from "../../shared/components/FormInputs/SelectInput.tsx";
import { Role } from "../data/models.ts";
import dayjs from "dayjs";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";


export const TeamMembersModal = () => {
  const dispatch = useAppDispatch();

  const dashboardState = useAppSelector((state) => state.dashboard);
  const { data: teams } = useFetchTeamsQuery();
  const team = teams?.find((t) => t.id === dashboardState.teamIdInTeamMembersModal);
  const { data: members } = useFetchTeamMembersQuery(dashboardState.teamIdInTeamMembersModal || "");

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "invite">("all");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");

  const { data: invitedUsers } = useFetchInvitedUsersQuery(dashboardState.teamIdInTeamMembersModal || "");
  const [inviteUserToTeam, {
    isError: isInvitingUserError,
    error: invitingUserError,
    isSuccess: isInvitingUserSuccess,
    reset: resetInviteUserToTeam,
  }] = useInviteUserToTeamMutation();

  const [cancelInvitation, {
    isError: isCancelingInvitationError,
    error: cancelingInvitationError,
    reset: resetCancelInvitation,
  }] = useCancelInvitationMutation();

  const [updateTeamMemberRoleMutation, {
    isError: isUpdatingRoleError,
    error: updatingRoleError,
    reset: resetUpdateTeamMemberRole,
  }] = useUpdateTeamMemberRoleMutation();

  const [revokeTeamMemberRoleMutation, {
    isError: isRevokingRoleError,
    error: revokingRoleError,
    reset: resetRevokeTeamMemberRole,
  }] = useRevokeTeamMemberRoleMutation();

  const resetAll = () => {
    resetInviteUserToTeam();
    resetCancelInvitation();
    resetUpdateTeamMemberRole();
    resetRevokeTeamMemberRole();
  };

  const handleClose = () => {
    resetAll();
    dispatch(closeTeamMembersModal());
  };

  if (!team) {
    return null;
  }

  const handleChangeRole = (userId: string, role: Role) => {
    resetAll();

    updateTeamMemberRoleMutation({
      teamId: team.id,
      userId,
      role,
    });
  };

  const handleRemove = (userId: string) => {
    resetAll();

    revokeTeamMemberRoleMutation({
      teamId: team.id,
      userId,
    });
  };

  const handleInvite = () => {
    if (!inviteEmail) {
      return;
    }

    resetAll();

    inviteUserToTeam({
      teamId: team.id,
      email: inviteEmail,
      role: inviteRole,
    });
  };

  const handleCancelInvitation = (invitationId: string) => {
    resetAll();

    cancelInvitation({
      teamId: team.id,
      invitationId,
    });
  };

  return <Modal
    show={!!dashboardState.teamIdInTeamMembersModal}
    onClose={handleClose}
    title="Team members"
    size="lg"
  >
    <div>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <div
            className={`nav-link cursor-pointer ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >All</div>
        </li>
        <li className="nav-item">
          <div
            className={`nav-link cursor-pointer ${activeTab === "invite" ? "active" : ""}`}
            onClick={() => setActiveTab("invite")}
          >Invite</div>
        </li>
      </ul>
      <div>
        {activeTab === "all" && <div>
          {(isUpdatingRoleError || isRevokingRoleError)
            && <ErrorMessage message={getErrorRTKQuery(updatingRoleError || revokingRoleError)}/>}

          <div className="mb-3">
            <TextInput
              label="Search"
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="list-group">
            {members?.filter(member => {
              return member.user.displayName.toLowerCase().includes(search.toLowerCase()) || member.user.email.toLowerCase().includes(search.toLowerCase());
            }).map((member) => {
              return <div
                key={member.userId}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="left">
                  <b>
                    {member.user.displayName}
                  </b>
                  <div>
                    {member.user.email}
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      Role:
                    </div>
                    <div>
                      <RoleBadge
                        member={member}
                        onClick={() => handleChangeRole(member.userId, "owner")}
                        role="owner"
                        displayRole="Owner"
                      />
                      <RoleBadge
                        member={member}
                        onClick={() => handleChangeRole(member.userId, "editor")}
                        role="editor"
                        displayRole="Editor"
                      />
                      <RoleBadge
                        member={member}
                        onClick={() => handleChangeRole(member.userId, "viewer")}
                        role="viewer"
                        displayRole="Viewer"
                      />
                    </div>
                  </div>
                </div>
                <div className="right">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(member.userId)}
                  >
                    Remove
                  </button>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {activeTab === "invite" && <div>
          {(isInvitingUserError || isCancelingInvitationError)
            && <ErrorMessage message={getErrorRTKQuery(invitingUserError || cancelingInvitationError)}/>}
          {isInvitingUserSuccess && <div className="alert alert-success">
            User invited successfully
          </div>}

          <div>
            <TextInput
              label="Email"
              value={inviteEmail}
              onChange={setInviteEmail}
            />
          </div>
          <div className="mt-3">
            <SelectInput
              label="Role"
              value={inviteRole}
              onChange={(role) => setInviteRole(role as Role)}
              items={[
                { value: "owner", label: "Owner" },
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" },
              ]}
            />
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-primary"
              onClick={handleInvite}
            >
              Invite
            </button>
          </div>

          {invitedUsers && invitedUsers.length > 0 && <div>
            <hr/>

            <h6>Invited users</h6>

            <div className="list-group">
              {invitedUsers?.map((invitedUser) => {
                return <div
                  key={invitedUser.id}
                  className="list-group-item"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="left">
                      <b>
                        {invitedUser.email}
                      </b>
                      <div>
                        Role: {invitedUser.role}
                      </div>
                      <div>
                        Expires on: {dayjs(invitedUser.expiresAt).format("DD-MM-YYYY")}
                      </div>
                    </div>
                    <div className="right">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelInvitation(invitedUser.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </div>}
        </div>}
      </div>
    </div>
  </Modal>;
};