import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store.ts";
import config from "../../../config.ts";
import { InvitedUser, Team, UserTeam } from "./models.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.baseUrl}/api/teams`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  }
});

export const teamsService = createApi({
  reducerPath: "teams",
  baseQuery,
  tagTypes: ["teams", "invitedUsers"],
  endpoints: (builder) => ({
    fetchTeams: builder.query<Team[], void>({
      query: () => "/",
      providesTags: ["teams"]
    }),
    createTeam: builder.mutation<Team, { name: string }>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body
      }),
      invalidatesTags: ["teams"]
    }),
    updateTeam: builder.mutation<Team, {teamId: string, body: {name: string}}>({
      query: ({ teamId, body }) => ({
        url: `/${teamId}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["teams"]
    }),
    deleteTeam: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `/${teamId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["teams"]
    }),
    restoreTeam: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `/${teamId}/restore`,
        method: "PUT"
      }),
      invalidatesTags: ["teams"]
    }),
    fetchTeamMembers: builder.query<UserTeam[], string>({
      query: (teamId) => `/${teamId}/members`
    }),
    fetchInvitedUsers: builder.query<InvitedUser[], string>({
      query: (teamId) => `/${teamId}/invitations`,
      providesTags: ["invitedUsers"]
    }),
    inviteUserToTeam: builder.mutation<void, { teamId: string, email: string, role: string }>({
      query: ({ teamId, email, role }) => ({
        url: `/${teamId}/invitations`,
        method: "POST",
        body: { email, role },
      }),
      invalidatesTags: ["invitedUsers"]
    }),
    cancelInvitation: builder.mutation<void, { teamId: string, invitationId: string }>({
      query: ({ teamId, invitationId }) => ({
        url: `/${teamId}/invitations/${invitationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["invitedUsers"]
    }),
  }),
});

export const {
  useFetchTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useRestoreTeamMutation,
  useFetchTeamMembersQuery,
  useFetchInvitedUsersQuery,
  useInviteUserToTeamMutation,
  useCancelInvitationMutation,
} = teamsService;