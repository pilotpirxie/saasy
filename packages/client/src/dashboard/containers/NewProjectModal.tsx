import { Modal } from "../components/Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { ColorPicker } from "../../shared/components/FormInputs/ColorPicker.tsx";
import { useEffect, useState } from "react";
import { SelectInput } from "../../shared/components/FormInputs/SelectInput.tsx";
import { useAppDispatch, useAppSelector } from "../../store.ts";
import { closeNewProjectModal } from "../data/dashboardSlice.ts";
import { useFetchTeamsQuery } from "../data/teamsService.ts";
import { ErrorMessage } from "../../shared/components/ErrorMessage.tsx";
import { getErrorRTKQuery } from "../../shared/utils/errorMessages.ts";

export const NewProjectModal = () => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff5976");
  const [teamId, setTeamId] = useState<string>("");
  const dashboardState = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();

  const {
    data,
    isLoading,
    isError,
    error
  } = useFetchTeamsQuery();
  const teams = data;

  const handleClose = () => {
    dispatch(closeNewProjectModal());
  };

  const handleCreate = () => {
    // ...
  };

  useEffect(() => {
    if (dashboardState.isNewProjectModalOpen) {
      setName("");
      setColor("#ff5976");
      setTeamId(dashboardState.initialTeamIdInNewProjectModal || "");
    }
  }, [dashboardState.initialTeamIdInNewProjectModal, dashboardState.isNewProjectModalOpen]);

  const teamsOptions = [
    { label: "Select team", value: "" },
  ];

  teams && teams.forEach((team) => {
    teamsOptions.push({ label: team.name, value: team.id });
  });

  return <Modal
    show={dashboardState.isNewProjectModalOpen && !isLoading}
    onClose={handleClose}
    title="New project"
    footerChildren={<button
      className="btn btn-sm btn-primary"
      onClick={handleCreate}
    >
      Create
    </button>}

  >
    <div>
      {isError && <ErrorMessage message={getErrorRTKQuery(error)}/>}

      <SelectInput
        label="Team"
        value={teamId}
        onChange={(value) => setTeamId(value)}
        items={teamsOptions}
      />

      <div className="mt-3">
        <TextInput
          label="Project name"
          value={name}
          onChange={setName}
        />

      </div>
      <div className="mt-3">
        <ColorPicker
          label="Color"
          value={color}
          onChange={setColor}
        />
      </div>
    </div>
  </Modal>;
};