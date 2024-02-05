import { ReactNode } from "react";

export const ScreenContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div className="vh-100 d-flex flex-column">
    {children}
  </div>;
};