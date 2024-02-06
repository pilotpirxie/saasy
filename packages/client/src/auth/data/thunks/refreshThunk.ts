import { createAsyncThunk } from "@reduxjs/toolkit";
import { GenericError } from "../../../shared/utils/errorMessages.ts";
import { refreshCode, RefreshCodeParams, RefreshCodeResponse } from "../api/refreshCode.ts";

type ThunkArg = {
  rejectValue: string;
}

export const refreshThunk = createAsyncThunk<RefreshCodeResponse, RefreshCodeParams, ThunkArg>(
  "auth/refresh",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await refreshCode(payload);

      localStorage.setItem("refreshToken", response.refreshToken);

      return response;
    } catch (error) {
      let errorMessage = GenericError;
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);