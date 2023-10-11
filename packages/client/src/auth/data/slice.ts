import { createSlice } from "@reduxjs/toolkit";
import ReduxStatuses from "../../shared/utils/statuses.ts";
import { login } from "./thunks/login.ts";
import { GenericError } from "../../shared/utils/errorMessages.ts";

export type AuthState = {
  session: {
    accessToken: string | null;
    refreshToken: string | null;
  },
  login: {
    error: string | null;
    status: ReduxStatuses;
  },
};

const initialState: AuthState = {
  session: {
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
  },
  login: {
    error: null,
    status: ReduxStatuses.INIT,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.login.error = null;
      state.login.status = ReduxStatuses.PENDING;
    }).addCase(login.fulfilled, (state, action) => {
      state.session.accessToken = action.payload.accessToken;
      state.session.refreshToken = action.payload.refreshToken;
      state.login.error = null;
      state.login.status = ReduxStatuses.SUCCESS;
    }).addCase(login.rejected, (state, action) => {
      state.login.error = action.payload || GenericError;
      state.login.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
    });
  }
});

export const authReducer = authSlice.reducer;
