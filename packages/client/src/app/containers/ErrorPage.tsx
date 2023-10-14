import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError();

  return <div className="row h-100">
    <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-4 offset-lg-4 h-100">
      <div className="h-100 d-flex flex-column justify-content-center">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        {isRouteErrorResponse(error) ? <div>
          <h2>{error.status}</h2>
          <p>{error.statusText}</p>
          {error.data?.message && <p>{error.data.message}</p>}
        </div> : <div>
          <h2>Something went wrong, try again or contact us</h2>
        </div>}
      </div>
    </div>
  </div>;
};