import { createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
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
      if (isAxiosError(error) && error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(GenericError);
    }
  }
);