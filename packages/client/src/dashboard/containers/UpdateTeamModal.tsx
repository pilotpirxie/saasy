import { useEffect, useState } from "react";
import { Modal } from "../components/Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { closeUpdateTeamModal } from "../data/dashboardSlice.ts";
import { deleteTeamAndCloseModal, restoreTeamAndCloseModal, updateTeamAndCloseModal } from "../data/dashboardThunks.ts";
import { useFetchTeamsQuery } from "../data/teamsService.ts";

export const UpdateTeamModal = () => {
  const [name, setName] = useState("");
  const dashboardState = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const { data: teams } = useFetchTeamsQuery();
  const team = teams?.find((t) => t.id === dashboardState.teamIdInUpdateTeamModal);

  const handleClose = () => {
    dispatch(closeUpdateTeamModal());
  };

  const handleUpdate = () => {
    if (!name) {
      return;
    }

    if (!dashboardState.teamIdInUpdateTeamModal) {
      return;
    }

    dispatch(updateTeamAndCloseModal({
      teamId: dashboardState.teamIdInUpdateTeamModal,
      name
    }));
  };

  const handleDelete = () => {
    if (!dashboardState.teamIdInUpdateTeamModal) {
      return;
    }

    dispatch(deleteTeamAndCloseModal(dashboardState.teamIdInUpdateTeamModal));
  };

  const handleRestore = () => {
    if (!dashboardState.teamIdInUpdateTeamModal) {
      return;
    }

    dispatch(restoreTeamAndCloseModal(dashboardState.teamIdInUpdateTeamModal));
  };

  useEffect(() => {
    setName(team?.name || "");
  }, [dashboardState.teamIdInUpdateTeamModal, team?.id, team?.name]);

  if (!team) {
    return null;
  }

  const isMarkedForDeletion = !!team.deleteAfter;

  return <Modal
    show={!!dashboardState.teamIdInUpdateTeamModal}
    onClose={handleClose}
    title={"Update team"}
    footerChildren={<div className="d-flex w-100 justify-content-between">
      {isMarkedForDeletion && <button
        className="btn btn-sm btn-outline-info"
        onClick={handleRestore}
      >
        Restore
      </button>}
      {!isMarkedForDeletion && <button
        className="btn btn-sm btn-outline-danger"
        onClick={handleDelete}
      >
        Delete
      </button>}
      <button
        className="btn btn-sm btn-primary"
        onClick={handleUpdate}
      >
        Update
      </button>
    </div>}
  >
    <div>
      <TextInput
        label={"Name"}
        value={name}
        onChange={(value) => setName(value)}
      />
      <div className='small'>This can be your company, team or organization.</div>
    </div>


  </Modal>;
};