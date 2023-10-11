import { getErrorMessage } from "../../shared/utils/errorMessages.ts";

export const ErrorMessage = ({ message }: { message: string | null }) => {
  if (message === null) {
    return null;
  }

  return (
    <div
      className="alert alert-danger"
      role="alert"
    >
      {getErrorMessage(message)}
    </div>
  );
};
