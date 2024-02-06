import { createAsyncThunk } from "@reduxjs/toolkit";
import { GenericError } from "../../../shared/utils/errorMessages.ts";
import { exchangeCode, ExchangeCodeParams, ExchangeCodeResponse } from "../api/exchangeCode.ts";

type ThunkArg = {
  rejectValue: string;
}

export const exchangeAuthCodeThunk = createAsyncThunk<ExchangeCodeResponse, ExchangeCodeParams, ThunkArg>(
  "auth/exchange",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await exchangeCode(payload);

      localStorage.setItem("refreshToken", response.refreshToken);

      return response;
    } catch (error) {
      let errorMessage = GenericError;
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);