import { createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";
import { logout, LogoutParams, LogoutResponse } from "../api/logout.ts";

type ThunkArg = {
  rejectValue: string;
}

export const logoutThunk = createAsyncThunk<LogoutResponse, LogoutParams, ThunkArg>(
  "auth/logout",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await logout(payload);

      localStorage.removeItem("refreshToken");

      return response;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(GenericError);
    }
  }
);