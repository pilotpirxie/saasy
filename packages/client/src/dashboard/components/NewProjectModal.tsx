import { Modal } from "./Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { ColorPicker } from "../../shared/components/FormInputs/ColorPicker.tsx";
import { useEffect, useState } from "react";
import { SelectInput } from "../../shared/components/FormInputs/SelectInput.tsx";

export const NewProjectModal = ({
  initialTeamId,
  teams,
  onCreate,
  onClose,
  show,
}: {
  initialTeamId: string;
  teams: {
    id: string;
    name: string;
  }[];
  onCreate: (teamId: string, name: string, color: string) => void;
  onClose: () => void;
  show: boolean;
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff5976");
  const [teamId, setTeamId] = useState(initialTeamId);

  useEffect(() => {
    if (show) {
      setName("");
      setColor("#ff5976");
      setTeamId(initialTeamId);
    }
  }, [initialTeamId, show]);

  return <Modal
    show={show}
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