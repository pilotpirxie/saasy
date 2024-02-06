import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DashboardState = {
  isNewProjectModalOpen: boolean;
  initialTeamIdInNewProjectModal?: string;
}

const initialState: DashboardState = {
  isNewProjectModalOpen: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    openNewProjectModal: (state, { payload }: PayloadAction<string | undefined>) => {
      state.isNewProjectModalOpen = true;
      state.initialTeamIdInNewProjectModal = payload;
    },
    closeNewProjectModal: (state) => {
      state.isNewProjectModalOpen = false;
    },
  },
});

export const dashboardReducer = dashboardSlice.reducer;
export const {
  openNewProjectModal,
  closeNewProjectModal,
} = dashboardSlice.actions;
