import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type LogoutParams = {
  refreshToken: string;
}

export type LogoutResponse = object

export const logout = async ({ refreshToken }: LogoutParams) => {
  try {
    await axiosInstance.post<LogoutResponse>("/api/auth/logout", {
      refreshToken,
    });
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
