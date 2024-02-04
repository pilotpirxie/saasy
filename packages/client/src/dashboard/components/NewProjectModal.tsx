import { Modal } from "./Modal/Modal.tsx";
import { TextInput } from "../../shared/components/FormInputs/TextInput.tsx";
import { ColorPicker } from "../../shared/components/FormInputs/ColorPicker.tsx";
import { useState } from "react";

export const NewProjectModal = ({
  teamName,
  onCreate,
  onClose,
}: {
  teamName: string;
  onCreate: (name: string, color: string) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff5976");

  return <Modal
    show={true}
    onClose={() => onClose()}
    title={"New project"}
    footerChildren={<button
      className="btn btn-sm btn-primary"
      onClick={() => onCreate(name, color)}
    >
      Create
    </button>}

  >
    <div>
      <TextInput
        label={"Team"}
        value={teamName}
        onChange={() => {}}
        disabled
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