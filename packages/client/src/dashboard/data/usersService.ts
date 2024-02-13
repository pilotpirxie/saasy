import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store.ts";
import { Account, Invitation, Profile, ProfileAddress, ProfileDisplayName } from "./models.ts";
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

export const usersService = createApi({
  reducerPath: "user",
  baseQuery,
  tagTypes: ["profile", "account", "invitations"],
  endpoints: (builder) => ({
    fetchProfile: builder.query<Profile, void>({
      query: () => "/profile",
      providesTags: ["profile"]
    }),
    updateDisplayName: builder.mutation<void, ProfileDisplayName>({
      query: (body) => ({
        url: "/profile/display-name",
        method: "PUT",
        body
      }),
      invalidatesTags: ["profile"]
    }),
    updateAddress: builder.mutation<void, ProfileAddress>({
      query: (body) => ({
        url: "/profile/address",
        method: "PUT",
        body
      }),
      invalidatesTags: ["profile"]
    }),
    fetchAccount: builder.query<Account, void>({
      query: () => "/account",
      providesTags: ["account"]
    }),
    updateEmail: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/email",
        method: "PUT",
        body
      }),
      invalidatesTags: ["account"]
    }),
    updatePassword: builder.mutation<void, { newPassword: string }>({
      query: (body) => ({
        url: "/password",
        method: "PUT",
        body
      })
    }),
    updateConsents: builder.mutation<void, { isNewsletterConsentGranted: boolean, isMarketingConsentGranted: boolean }>({
      query: (body) => ({
        url: "/consents",
        method: "PUT",
        body
      }),
      invalidatesTags: ["account"]
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/account",
        method: "DELETE"
      })
    }),
    fetchInvitations: builder.query<Invitation[], void>({
      query: () => "/invitations",
      providesTags: ["invitations"]
    }),
    acceptInvitation: builder.mutation<void, { invitationId: string }>({
      query: ({ invitationId }) => ({
        url: `/invitations/${invitationId}/accept`,
        method: "PUT"
      }),
      invalidatesTags: ["invitations"]
    }),
    declineInvitation: builder.mutation<void, { invitationId: string }>({
      query: ({ invitationId }) => ({
        url: `/invitations/${invitationId}/decline`,
        method: "PUT"
      }),
      invalidatesTags: ["invitations"]
    })
  }),
});

export const {
  useFetchProfileQuery,
  useFetchAccountQuery,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  useFetchInvitationsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useUpdateDisplayNameMutation,
  useUpdateAddressMutation,
  useUpdateConsentsMutation,
  useDeleteAccountMutation
} = usersService;