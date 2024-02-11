import { useState } from "react";
import { Modal } from "../components/Modal/Modal.tsx";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { useFetchTeamMembersQuery, useFetchTeamsQuery } from "../data/teamsService.ts";
import { closeTeamMembersModal } from "../data/dashboardSlice.ts";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { RoleBadge } from "../components/RoleBadge.tsx";
import { SelectInput } from "../../shared/components/FormInputs/SelectInput.tsx";
import { Role } from "../data/models.ts";


export const TeamMembersModal = () => {
  const dashboardState = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const { data: teams } = useFetchTeamsQuery();
  const team = teams?.find((t) => t.id === dashboardState.teamIdInTeamMembersModal);
  const { data: members } = useFetchTeamMembersQuery(dashboardState.teamIdInTeamMembersModal || "");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "invite">("all");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");

  const handleClose = () => {
    dispatch(closeTeamMembersModal());
  };

  if (!team) {
    return null;
  }

  const handleChangeRole = (userId: string, teamId: string, role: Role) => {
    // ...
  };

  const isAtLeastTwoOwners =
    members && members?.filter((m) => m.role === "owner").length > 1;

  return <Modal
    show={!!dashboardState.teamIdInTeamMembersModal}
    onClose={handleClose}
    title={"Team members"}
    size='lg'
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
          <div className="mb-3">
            <TextInput
              label={"Search"}
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className='list-group'>
            {members?.filter(member => {
              return member.user.displayName.toLowerCase().includes(search.toLowerCase()) || member.user.email.toLowerCase().includes(search.toLowerCase());
            }).map((member) => {
              return <div
                key={member.userId}
                className='list-group-item d-flex justify-content-between align-items-center'
              >
                <div className="left">
                  <b>
                    {member.user.displayName}
                  </b>
                  <div>
                    {member.user.email}
                  </div>
                  <div className={"d-flex align-items-center"}>
                    <div className="me-2">
                      Role:
                    </div>
                    <div>
                      <RoleBadge
                        member={member}
                        onClick={() => handleChangeRole(member.userId, member.teamId, "owner")}
                        role={"owner"}
                        displayRole={"Owner"}
                      />
                      <RoleBadge
                        member={member}
                        onClick={() => handleChangeRole(member.userId, member.teamId, "editor")}
                        role={"editor"}
                        displayRole={"Editor"}
                      />
                      <RoleBadge
                        member={member}
                        onClick={() => handleChangeRole(member.userId, member.teamId, "viewer")}
                        role={"viewer"}
                        displayRole={"Viewer"}
                      />
                    </div>
                  </div>
                </div>
                <div className="right">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={member.role === "owner" && !isAtLeastTwoOwners}
                  >
                    Remove
                  </button>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {activeTab === "invite" && <div>
          <div>
            <TextInput
              label={"Email"}
              value={inviteEmail}
              onChange={setInviteEmail}
            />
          </div>
          <div className='mt-3'>
            <SelectInput
              label={"Role"}
              value={inviteRole}
              onChange={(role) => setInviteRole(role as Role)}
              items={[
                { value: "owner", label: "Owner" },
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" },
              ]}
            />
          </div>
          <div className='d-flex justify-content-end mt-3'>
            <button
              className="btn btn-primary"
            >
              Invite
            </button>
          </div>
        </div>}
      </div>
    </div>


  </Modal>;
};