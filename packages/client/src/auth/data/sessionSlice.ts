import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "./authService.ts";
import { AuthCodes } from "./models.ts";

export type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  signedIn: boolean;
  isInitialized: boolean;
};

const initialState: SessionState = {
  accessToken: null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  signedIn: false,
  isInitialized: false
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    initializeOnly(state) {
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        authService.endpoints.exchangeAuthCode.matchFulfilled,
        authService.endpoints.refresh.matchFulfilled,
      ),
      (state, action: PayloadAction<AuthCodes>) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.signedIn = true;
        state.isInitialized = true;
      }
    );

    builder.addMatcher(
      isAnyOf(
        authService.endpoints.exchangeAuthCode.matchRejected,
        authService.endpoints.refresh.matchRejected,
        authService.endpoints.logout.matchRejected,
        authService.endpoints.logout.matchFulfilled,
      ),
      (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.signedIn = false;
        state.isInitialized = true;
      }
    );
  }
});

export const sessionReducer = sessionSlice.reducer;
export const { initializeOnly } = sessionSlice.actions;