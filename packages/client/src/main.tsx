import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./containers/Login.tsx";
import "fastbootstrap/dist/js/fastbootstrap";
import "fastbootstrap/dist/css/fastbootstrap.css";
import "remixicon/fonts/remixicon.css";
import { Register } from "./containers/Register.tsx";
import { ForgotPassword } from "./containers/ForgotPassword.tsx";
import { ResetPassword } from "./containers/ResetPassword.tsx";

const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />
  },
  {
    path: "register",
    element: <Register />
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "reset-password",
    element: <ResetPassword />
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);