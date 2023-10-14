import { createSlice } from "@reduxjs/toolkit";
import ReduxStatuses from "../../shared/utils/statuses.ts";
import { exchangeAuthCodeThunk } from "./thunks/exchangeAuthCodeThunk.ts";
import { GenericError } from "../../shared/utils/errorMessages.ts";
import { refreshThunk } from "./thunks/refreshThunk.ts";
import { logoutThunk } from "./thunks/logoutThunk.ts";

export type AuthState = {
  session: {
    accessToken: string | null;
    refreshToken: string | null;
    signedIn: boolean;
  },
  exchangeAuthCode: {
    error: string | null;
    status: ReduxStatuses;
  },
  refreshAuthCode: {
    error: string | null;
    status: ReduxStatuses;
  },
  logout: {
    error: string | null;
    status: ReduxStatuses;
  }
};

const initialState: AuthState = {
  session: {
    accessToken: null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    signedIn: false,
  },
  exchangeAuthCode: {
    error: null,
    status: ReduxStatuses.INIT,
  },
  refreshAuthCode: {
    error: null,
    status: ReduxStatuses.INIT,
  },
  logout: {
    error: null,
    status: ReduxStatuses.INIT,
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(exchangeAuthCodeThunk.pending, (state) => {
      state.exchangeAuthCode.error = null;
      state.exchangeAuthCode.status = ReduxStatuses.PENDING;
    }).addCase(exchangeAuthCodeThunk.fulfilled, (state, action) => {
      state.session.accessToken = action.payload.accessToken;
      state.session.refreshToken = action.payload.refreshToken;
      state.exchangeAuthCode.error = null;
      state.exchangeAuthCode.status = ReduxStatuses.SUCCESS;
      state.session.signedIn = true;
    }).addCase(exchangeAuthCodeThunk.rejected, (state, action) => {
      state.exchangeAuthCode.error = action.payload || GenericError;
      state.exchangeAuthCode.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
      state.session.signedIn = false;
    }).addCase(refreshThunk.pending, (state) => {
      state.refreshAuthCode.error = null;
      state.refreshAuthCode.status = ReduxStatuses.PENDING;
    }).addCase(refreshThunk.fulfilled, (state, action) => {
      state.session.accessToken = action.payload.accessToken;
      state.session.refreshToken = action.payload.refreshToken;
      state.refreshAuthCode.error = null;
      state.refreshAuthCode.status = ReduxStatuses.SUCCESS;
      state.session.signedIn = true;
    }).addCase(refreshThunk.rejected, (state, action) => {
      state.refreshAuthCode.error = action.payload || GenericError;
      state.refreshAuthCode.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
      state.session.signedIn = false;
    }).addCase(logoutThunk.pending, (state) => {
      state.logout.error = null;
      state.logout.status = ReduxStatuses.PENDING;
    }).addCase(logoutThunk.fulfilled, (state) => {
      state.logout.error = null;
      state.logout.status = ReduxStatuses.SUCCESS;
      state.session.accessToken = null;
      state.session.refreshToken = null;
      state.session.signedIn = false;
    }).addCase(logoutThunk.rejected, (state, action) => {
      state.logout.error = action.payload || GenericError;
      state.logout.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
      state.session.signedIn = false;
    });
  }
});

export const authReducer = authSlice.reducer;
