import { createAsyncThunk } from "@reduxjs/toolkit";
import { refreshAuthCode } from "./refreshAuthCode.ts";

type ThunkArg = {
  rejectValue: string;
}

type LoginFromLocalStorageResponse = object
type LoginFromLocalStorageParams = object

export const loginFromLocalStorage = createAsyncThunk<LoginFromLocalStorageParams, LoginFromLocalStorageResponse, ThunkArg>(
  "auth/loginFromLocalStorage",
  async (_, { dispatch }) => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      await dispatch(refreshAuthCode({
        refreshToken,
      }));
    }
  }
);