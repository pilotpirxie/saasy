import "./Modal.css";
import { ReactNode } from "react";

export const Modal = ({
  show,
  onClose,
  children,
  title,
  footerChildren,
}: {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
  footerChildren?: ReactNode;
  title: string;
}) => {
  if (!show) {
    return null;
  }

  return <div className="modal fade show d-block bg-modal">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footerChildren && <div className="modal-footer">
          {footerChildren}
        </div>}
      </div>
    </div>
  </div>
  ;
};