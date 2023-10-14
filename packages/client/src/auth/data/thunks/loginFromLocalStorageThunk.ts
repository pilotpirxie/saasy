import { createAsyncThunk } from "@reduxjs/toolkit";
import { refreshThunk } from "./refreshThunk.ts";

type ThunkArg = {
  rejectValue: string;
}

type LoginFromLocalStorageResponse = object
type LoginFromLocalStorageParams = object

export const loginFromLocalStorageThunk = createAsyncThunk<LoginFromLocalStorageParams, LoginFromLocalStorageResponse, ThunkArg>(
  "auth/loginFromLocalStorage",
  async (_, { dispatch }) => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      await dispatch(refreshThunk({
        refreshToken,
      }));
    }
  }
);