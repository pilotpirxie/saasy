import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type RefreshCodeParams = {
  refreshToken: string;
}

export type RefreshCodeResponse = {
  accessToken: string;
  refreshToken: string;
}

export const refreshCode = async ({ refreshToken }: RefreshCodeParams) => {
  try {
    const response = await axiosInstance.post<RefreshCodeResponse>("/api/auth/refresh", {
      refreshToken,
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
