import { createSlice } from "@reduxjs/toolkit";
import ReduxStatuses from "../statuses/statuses.ts";
import { login } from "./thunks.ts";


export type SessionsState = {
  accessToken: string;
  refreshToken: string;
  error: string;
  status: ReduxStatuses;
};

const initialState: SessionsState = {
  accessToken: localStorage.getItem("accessToken") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  error: "",
  status: ReduxStatuses.INIT,
};

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.error = "";
      state.status = ReduxStatuses.PENDING;
    }).addCase(login.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.status = ReduxStatuses.SUCCESS;
    }).addCase(login.rejected, (state, action) => {
      state.error = action.error.message || "";
      state.status = ReduxStatuses.FAILURE;
      state.accessToken = "";
      state.refreshToken = "";
    });
  }
});


const sessionsReducer = sessionsSlice.reducer;
export default sessionsReducer;