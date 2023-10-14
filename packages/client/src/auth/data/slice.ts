import { createSlice } from "@reduxjs/toolkit";
import ReduxStatuses from "../../shared/utils/statuses.ts";
import { exchangeAuthCode } from "./thunks/exchangeAuthCode.ts";
import { GenericError } from "../../shared/utils/errorMessages.ts";
import { refreshAuthCode } from "./thunks/refreshAuthCode.ts";

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
  }
};

const initialState: AuthState = {
  session: {
    accessToken: localStorage.getItem("accessToken") || null,
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
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(exchangeAuthCode.pending, (state) => {
      state.exchangeAuthCode.error = null;
      state.exchangeAuthCode.status = ReduxStatuses.PENDING;
    }).addCase(exchangeAuthCode.fulfilled, (state, action) => {
      state.session.accessToken = action.payload.accessToken;
      state.session.refreshToken = action.payload.refreshToken;
      state.exchangeAuthCode.error = null;
      state.exchangeAuthCode.status = ReduxStatuses.SUCCESS;
      state.session.signedIn = true;
    }).addCase(exchangeAuthCode.rejected, (state, action) => {
      state.exchangeAuthCode.error = action.payload || GenericError;
      state.exchangeAuthCode.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
      state.session.signedIn = false;
    }).addCase(refreshAuthCode.pending, (state) => {
      state.refreshAuthCode.error = null;
      state.refreshAuthCode.status = ReduxStatuses.PENDING;
    }).addCase(refreshAuthCode.fulfilled, (state, action) => {
      state.session.accessToken = action.payload.accessToken;
      state.session.refreshToken = action.payload.refreshToken;
      state.refreshAuthCode.error = null;
      state.refreshAuthCode.status = ReduxStatuses.SUCCESS;
      state.session.signedIn = true;
    }).addCase(refreshAuthCode.rejected, (state, action) => {
      state.refreshAuthCode.error = action.payload || GenericError;
      state.refreshAuthCode.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
      state.session.signedIn = false;
    });
  }
});

export const authReducer = authSlice.reducer;
