import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store.ts";
import config from "../../../config.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.baseUrl}/api/projects`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  }
});

export const projectsService = createApi({
  reducerPath: "projects",
  baseQuery,
  tagTypes: ["projects"],
  endpoints: (builder) => ({
    createProject: builder.mutation<void, { name: string, teamId: string }>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body
      }),
      invalidatesTags: ["projects"]
    }),
  }),
});

export const {
  useCreateProjectMutation,
} = projectsService;