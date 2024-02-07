import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DashboardState = {
  isNewProjectModalOpen: boolean;
  initialTeamIdInNewProjectModal?: string;
  isNewTeamModalOpen: boolean;
}

const initialState: DashboardState = {
  isNewProjectModalOpen: false,
  isNewTeamModalOpen: false,
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
    openNewTeamModal: (state) => {
      state.isNewTeamModalOpen = true;
    },
    closeNewTeamModal: (state) => {
      state.isNewTeamModalOpen = false;
    },
  },
});

export const dashboardReducer = dashboardSlice.reducer;
export const {
  openNewProjectModal,
  closeNewProjectModal,
  openNewTeamModal,
  closeNewTeamModal,
} = dashboardSlice.actions;
