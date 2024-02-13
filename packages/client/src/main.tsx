import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { LoginPage } from "./auth/containers/LoginPage.tsx";
// import "remixicon/fonts/remixicon.css";
import { RegisterPage } from "./auth/containers/RegisterPage.tsx";
import { ForgotPasswordPage } from "./auth/containers/ForgotPasswordPage.tsx";
import { ExchangeCodePage } from "./auth/containers/ExchangeCodePage.tsx";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import { RedirectIfAuth } from "./shared/containers/RedirectIfAuth.tsx";
import { AppRoot } from "./app/containers/AppRoot.tsx";
import { ErrorPage } from "./app/containers/ErrorPage.tsx";
import { Dashboard } from "./dashboard/containers/Dashboard.tsx";
import { RequiredAuth } from "./shared/containers/RequiredAuth.tsx";
import { Invitations } from "./dashboard/containers/Invitations.tsx";
import { AccountSettings } from "./dashboard/containers/AccountSettings.tsx";
import { Terms } from "./dashboard/containers/Terms.tsx";
import { Privacy } from "./dashboard/containers/Privacy.tsx";
import { Feedback } from "./dashboard/containers/Feedback.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoot />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/auth/login" />
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
        path: "/auth/forgot-password",
        element: <RedirectIfAuth>
          <ForgotPasswordPage />
        </RedirectIfAuth>
      },
      {
        path: "/auth/exchange-code",
        element: <RedirectIfAuth>
          <ExchangeCodePage />
        </RedirectIfAuth>
      },
      {
        path: "/dashboard/invitations",
        element: <RequiredAuth>
          <Invitations />
        </RequiredAuth>
      },
      {
        path: "/dashboard/settings",
        element: <RequiredAuth>
          <AccountSettings />
        </RequiredAuth>
      },
      {
        path: "/dashboard",
        element: <RequiredAuth>
          <Dashboard />
        </RequiredAuth>
      },
      {
        path: "/terms",
        element: <Terms />
      },
      {
        path: "/privacy",
        element: <Privacy />
      },
      {
        path: "/feedback",
        element: <Feedback />
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);