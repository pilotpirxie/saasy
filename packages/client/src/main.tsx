import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { LoginPage } from "./auth/containers/LoginPage.tsx";
import "fastbootstrap/dist/css/fastbootstrap.css";
import "remixicon/fonts/remixicon.css";
import { RegisterPage } from "./auth/containers/RegisterPage.tsx";
import { ForgotPasswordPage } from "./auth/containers/ForgotPasswordPage.tsx";
import { ResetPasswordPage } from "./auth/containers/ResetPasswordPage.tsx";
import { ExchangeCodePage } from "./auth/containers/ExchangeCodePage.tsx";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import { RedirectIfAuth } from "./shared/containers/RedirectIfAuth.tsx";
import { AppRoot } from "./app/containers/AppRoot.tsx";
import { ErrorPage } from "./app/containers/ErrorPage.tsx";
import { Dashboard } from "./dashboard/containers/Dashboard.tsx";
import { RequiredAuth } from "./shared/containers/RequiredAuth.tsx";
import { ResendVerify } from "./auth/containers/ResendVerify.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoot />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to={"/auth/login"} />
      },
      {
        path: "/auth/login",
        element: <RedirectIfAuth>
          <LoginPage />
        </RedirectIfAuth>
      },
      {
        path: "/auth/register",
        element: <RedirectIfAuth>
          <RegisterPage />
        </RedirectIfAuth>
      },
      {
        path: "/auth/resend",
        element: <RedirectIfAuth>
          <ResendVerify />
        </RedirectIfAuth>
      },
      {
        path: "/auth/forgot-password",
        element: <RedirectIfAuth>
          <ForgotPasswordPage />
        </RedirectIfAuth>
      },
      {
        path: "/auth/reset-password",
        element: <RedirectIfAuth>
          <ResetPasswordPage />
        </RedirectIfAuth>
      },
      {
        path: "/auth/exchange-code",
        element: <RedirectIfAuth>
          <ExchangeCodePage />
        </RedirectIfAuth>
      },
      {
        path: "/dashboard",
        element: <RequiredAuth>
          <Dashboard />
        </RequiredAuth>
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);