import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store.ts";
import { Account, Profile } from "./models.ts";
import config from "../../../config.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.baseUrl}/api/users`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  }
});

export const userService = createApi({
  reducerPath: "user",
  baseQuery,
  endpoints: (builder) => ({
    fetchProfile: builder.query<Profile, void>({
      query: () => "profile"
    }),
    updateProfile: builder.mutation<void, Profile>({
      query: (body) => ({
        url: "profile",
        method: "PUT",
        body
      })
    }),
    fetchAccount: builder.query<Account, void>({
      query: () => "account"
    }),
    updateEmail: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "email",
        method: "PUT",
        body
      })
    }),
    updatePassword: builder.mutation<void, { password: string }>({
      query: (body) => ({
        url: "password",
        method: "PUT",
        body
      })
    }),
  }),
});

export const {
  useFetchProfileQuery,
  useUpdateProfileMutation,
  useFetchAccountQuery,
  useUpdateEmailMutation,
  useUpdatePasswordMutation
} = userService;