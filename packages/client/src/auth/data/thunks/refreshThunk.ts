import { createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
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
      if (isAxiosError(error) && error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(GenericError);
    }
  }
);