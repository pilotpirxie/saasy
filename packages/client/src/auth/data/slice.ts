import { createSlice } from "@reduxjs/toolkit";
import ReduxStatuses from "../../shared/utils/statuses.ts";
import { exchangeAuthCode } from "./thunks/exchangeAuthCode.ts";
import { GenericError } from "../../shared/utils/errorMessages.ts";

export type AuthState = {
  session: {
    accessToken: string | null;
    refreshToken: string | null;
  },
  exchangeAuthCode: {
    error: string | null;
    status: ReduxStatuses;
  },
};

const initialState: AuthState = {
  session: {
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
  },
  exchangeAuthCode: {
    error: null,
    status: ReduxStatuses.INIT,
  },
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
    }).addCase(exchangeAuthCode.rejected, (state, action) => {
      state.exchangeAuthCode.error = action.payload || GenericError;
      state.exchangeAuthCode.status = ReduxStatuses.FAILURE;
      state.session.accessToken = null;
      state.session.refreshToken = null;
    });
  }
});

export const authReducer = authSlice.reducer;
