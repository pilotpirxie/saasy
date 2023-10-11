import { createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";
import { loginByEmail, LoginParams, LoginResponse } from "../api/loginByEmail.ts";


type ThunkArg = {
  rejectValue: string;
}

export const login = createAsyncThunk<LoginResponse, LoginParams, ThunkArg>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginByEmail(payload);

      localStorage.setItem("accessToken", response.accessToken);
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