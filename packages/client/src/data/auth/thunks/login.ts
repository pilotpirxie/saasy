import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../utils/errorMessages.ts";

type Payload = {
  email: string;
  password: string;
  totp?: string;
}

type Returned = {
  accessToken: string;
  refreshToken: string;
}

type ThunkArg = {
  rejectValue: string;
}

export const login = createAsyncThunk<Returned, Payload, ThunkArg>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<Returned>("/api/auth/login", {
        email: payload.email,
        password: payload.password,
        totpCode: payload.totp || undefined,
      });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(GenericError);
    }
  }
);