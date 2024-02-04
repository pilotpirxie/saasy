import { Modal } from "./Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { ColorPicker } from "../../shared/components/FormInputs/ColorPicker.tsx";
import { useState } from "react";
import { SelectInput } from "../../shared/components/FormInputs/SelectInput.tsx";

export const NewProjectModal = ({
  initialTeamId,
  teams,
  onCreate,
  onClose,
}: {
  initialTeamId: string;
  teams: {
    id: string;
    name: string;
  }[];
  onCreate: (teamId: string, name: string, color: string) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff5976");
  const [teamId, setTeamId] = useState(initialTeamId);

  return <Modal
    show={true}
    onClose={() => onClose()}
    title={"New project"}
    footerChildren={<button
      className="btn btn-sm btn-primary"
      onClick={() => onCreate(teamId, name, color)}
    >
      Create
    </button>}

  >
    <div>
      <SelectInput
        label={"Team"}
        value={teamId}
        onChange={(value) => setTeamId(value)}
        items={teams.map((team) => ({ label: team.name, value: team.id }))}
      />

      <div className="mt-3">
        <TextInput
          label={"Project name"}
          value={name}
          onChange={setName}
        />

      </div>
      <div className="mt-3">
        <ColorPicker
          label={"Color"}
          value={color}
          onChange={setColor}
        />
      </div>
    </div>
  </Modal>;
};