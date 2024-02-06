import { createAsyncThunk } from "@reduxjs/toolkit";
import { GenericError } from "../../../shared/utils/errorMessages.ts";
import { logout, LogoutParams } from "../api/logout.ts";

type ThunkArg = {
  rejectValue: string;
}

export const logoutThunk = createAsyncThunk<object, LogoutParams, ThunkArg>(
  "auth/logout",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await logout(payload);

      localStorage.removeItem("refreshToken");

      return response;
    } catch (error) {
      let errorMessage = GenericError;
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);