import { PropsWithChildren } from "react";

export const CleanLayout = ({ children }: PropsWithChildren) => (<div className="container h-100">
  <div className="row h-100">
    <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-4 offset-lg-4 h-100">
      <div className="h-100 d-flex flex-column justify-content-center">
        {children}
      </div>
    </div>
  </div>
</div>);
