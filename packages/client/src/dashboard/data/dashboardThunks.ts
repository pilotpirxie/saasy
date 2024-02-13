import { createAsyncThunk } from "@reduxjs/toolkit";
import { teamsService } from "./teamsService.ts";
import { closeNewTeamModal, closeUpdateTeamModal } from "./dashboardSlice.ts";

export const createTeamAndCloseModal = createAsyncThunk(
  "dashboard/createTeamAndCloseModal",
  async (teamName: string, { dispatch }) => {
    try {
      await dispatch(teamsService.endpoints.createTeam.initiate({ name: teamName }));
      dispatch(closeNewTeamModal());
    } catch (error) {
      console.warn("Failed to create team", error);
    }
  });

export const updateTeamAndCloseModal = createAsyncThunk(
  "dashboard/updateTeamAndCloseModal",
  async ({ teamId, name }: {teamId: string, name: string}, { dispatch }) => {
    try {
      await dispatch(teamsService.endpoints.updateTeam.initiate({
        teamId,
        body: { name },
      }));
      dispatch(closeUpdateTeamModal());
    } catch (error) {
      console.warn("Failed to update team", error);
    }
  });

export const deleteTeamAndCloseModal = createAsyncThunk(
  "dashboard/deleteTeamAndCloseModal",
  async (teamId: string, { dispatch }) => {
    try {
      await dispatch(teamsService.endpoints.deleteTeam.initiate(teamId));
      dispatch(closeUpdateTeamModal());
    } catch (error) {
      console.warn("Failed to delete team", error);
    }
  });

export const restoreTeamAndCloseModal = createAsyncThunk(
  "dashboard/restoreTeamAndCloseModal",
  async (teamId: string, { dispatch }) => {
    try {
      await dispatch(teamsService.endpoints.restoreTeam.initiate(teamId));
      dispatch(closeUpdateTeamModal());
    } catch (error) {
      console.warn("Failed to restore team", error);
    }
  });

