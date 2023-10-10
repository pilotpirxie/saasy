import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/httpClient.ts";
import { isAxiosError } from "axios";

interface LoginPayload {
  email: string;
  password: string;
  totCode?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = createAsyncThunk(
  "sessions/login",
  async (payload: LoginPayload) => {
    try {

      const response = await axiosInstance.post<AuthResponse>("/api/auth/login", {
        email: payload.email,
        password: payload.password,
        totpCode: payload.totCode,
      });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data;
    } catch (error) {
      if (!isAxiosError(error) || !error.response || !error.response.data || !error.response.data.error) {
        throw Error("Something went wrong, please try again later");
      }

      const errorCode = error.response.data.error;
      if (errorCode === "ValidationError") {
        throw new Error("Invalid credentials, check your data and try again");
      }

      if (errorCode === "UserNotFound") {
        throw new Error("User not found");
      }

      if (errorCode === "InvalidAuthProvider") {
        throw new Error("Invalid auth provider. This account was created with a different auth method");
      }

      if (errorCode === "EmailNotVerified") {
        throw new Error("Email not verified");
      }

      if (errorCode === "TotpCodeRequired") {
        throw new Error("TOTP code required to login");
      }

      if (errorCode === "InvalidTotpCode") {
        throw new Error("Invalid TOTP code. Check your code and try again");
      }

      throw Error("Something went wrong, please try again later");
    }
  }
);