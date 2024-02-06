import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import config from "../../../config.ts";
import { RootState } from "../../store.ts";
import { AuthCodes } from "./models.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.baseUrl}/api/auth`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  }
});

export const authService = createApi({
  reducerPath: "auth",
  baseQuery,
  endpoints: (builder) => ({
    exchangeAuthCode: builder.mutation<AuthCodes, {
      code: string;
    }>({
      query: (body) => ({
        url: "exchange",
        method: "POST",
        body
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("refreshToken", data.refreshToken);
        } catch (error) {
          console.warn("Failed to exchange auth code", error);
        }
      }
    }),
    refresh: builder.mutation<AuthCodes, {
      refreshToken: string;
    }>({
      query: (body) => ({
        url: "refresh",
        method: "POST",
        body
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("refreshToken", data.refreshToken);
        } catch (error) {
          console.warn("Failed to refresh token", error);
        }
      }
    }),
    logout: builder.mutation<void, {
      refreshToken: string;
    }>({
      query: (body) => ({
        url: "logout",
        method: "DELETE",
        body
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem("refreshToken");
        } catch (error) {
          console.warn("Failed to logout", error);
        }
      }
    }),
  }),
});

export const {
  useExchangeAuthCodeMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authService;
