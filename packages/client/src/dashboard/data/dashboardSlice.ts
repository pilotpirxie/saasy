import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DashboardState = {
  isNewProjectModalOpen: boolean;
  initialTeamIdInNewProjectModal?: string;
  isNewTeamModalOpen: boolean;
  teamIdInUpdateTeamModal?: string;
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
      state.initialTeamIdInNewProjectModal = undefined;
    },
    openNewTeamModal: (state) => {
      state.isNewTeamModalOpen = true;
    },
    closeNewTeamModal: (state) => {
      state.isNewTeamModalOpen = false;
    },
    openUpdateTeamModal: (state, { payload }: PayloadAction<string>) => {
      state.teamIdInUpdateTeamModal = payload;
    },
    closeUpdateTeamModal: (state) => {
      state.teamIdInUpdateTeamModal = undefined;
    },
  },
});

export const dashboardReducer = dashboardSlice.reducer;
export const {
  openNewProjectModal,
  closeNewProjectModal,
  openNewTeamModal,
  closeNewTeamModal,
  openUpdateTeamModal,
  closeUpdateTeamModal,
} = dashboardSlice.actions;
