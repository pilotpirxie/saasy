import { useEffect, useState } from "react";
import { Modal } from "../components/Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { closeNewTeamModal } from "../data/dashboardSlice.ts";
import { createTeamAndCloseModal } from "../data/dashboardThunks.ts";

export const NewTeamModal = () => {
  const [name, setName] = useState("");
  const dashboardState = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeNewTeamModal());
  };

  const handleCreate = () => {
    if (!name) {
      return;
    }

    dispatch(createTeamAndCloseModal(name));
  };

  useEffect(() => {
    setName("");
  }, [dashboardState.isNewTeamModalOpen]);

  return <Modal
    show={dashboardState.isNewTeamModalOpen}
    onClose={handleClose}
    title="New team"
    footerChildren={<button
      className="btn btn-sm btn-primary"
      onClick={handleCreate}
    >
      Create
    </button>}
  >
    <div>
      <TextInput
        label="Name"
        value={name}
        onChange={(value) => setName(value)}
      />
      <div className="small">This can be your company, team or organization.</div>
    </div>


  </Modal>;
};