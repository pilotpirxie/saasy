import { ReactNode } from "react";

export const SideLayout = ({ leftChildren, rightChildren }: {leftChildren: ReactNode, rightChildren: ReactNode}) => <div
  className="container-fluid h-100"
>
  <div className="row h-100">
    <div className="d-none d-lg-flex col-lg-6 bg-dark text-white">
      <div className="d-flex h-100 w-100 justify-content-center align-items-center">
        {leftChildren}
      </div>
    </div>
    <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-4 offset-lg-1 h-100">
      <div
        className="h-100 d-flex flex-column justify-content-center"
        style={{
          maxWidth: "460px",
          display: "block",
          margin: "0 auto",
        }}
      >
        {rightChildren}
      </div>
    </div>
  </div>
</div>;
