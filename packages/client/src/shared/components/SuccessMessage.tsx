export const SuccessMessage = ({ message }: { message: string | null }) => {
  if (message === null) {
    return null;
  }

  return (
    <div
      className="alert alert-success"
      role="alert"
    >
      {message}
    </div>
  );
};
