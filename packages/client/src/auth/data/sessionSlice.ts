import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authService, ExchangeCodeResponse } from "./authService.ts";

export type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  signedIn: boolean;
};

const initialState: SessionState = {
  accessToken: null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  signedIn: false,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      authService.endpoints.exchangeAuthCode.matchFulfilled,
      (state, action: PayloadAction<ExchangeCodeResponse>) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.signedIn = true;
      }
    );

    builder.addMatcher(
      authService.endpoints.refresh.matchFulfilled,
      (state, action: PayloadAction<ExchangeCodeResponse>) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.signedIn = true;
      }
    );

    builder.addMatcher(
      authService.endpoints.logout.matchFulfilled,
      (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.signedIn = false;
      }
    );
  }
});

export const sessionReducer = sessionSlice.reducer;
