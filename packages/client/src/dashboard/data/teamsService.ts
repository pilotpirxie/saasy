import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store.ts";
import config from "../../../config.ts";
import { Team } from "./models.ts";

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
  tagTypes: ["teams"],
  endpoints: (builder) => ({
    fetchTeams: builder.query<Team[], void>({
      query: () => "/",
      providesTags: ["teams"]
    }),
  }),
});

export const {
  useFetchTeamsQuery,
} = teamsService;