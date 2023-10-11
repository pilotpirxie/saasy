import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./auth/containers/LoginPage.tsx";
import "fastbootstrap/dist/js/fastbootstrap";
import "fastbootstrap/dist/css/fastbootstrap.css";
import "remixicon/fonts/remixicon.css";
import { RegisterPage } from "./auth/containers/RegisterPage.tsx";
import { ForgotPasswordPage } from "./auth/containers/ForgotPasswordPage.tsx";
import { ResetPasswordPage } from "./auth/containers/ResetPasswordPage.tsx";
import { LoginProviderHandlerPage } from "./auth/containers/LoginProviderHandlerPage.tsx";
import { Provider } from "react-redux";
import { store } from "./store.ts";

const router = createBrowserRouter([
  {
    path: "login",
    element: <LoginPage />
  },
  {
    path: "register",
    element: <RegisterPage />
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />
  },
  {
    path: "reset-password",
    element: <ResetPasswordPage />
  },
  {
    path: "login-provider-callback",
    element: <LoginProviderHandlerPage />
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);