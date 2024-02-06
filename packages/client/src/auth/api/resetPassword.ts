import axiosInstance from "../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../shared/utils/errorMessages.ts";

export type ResetPasswordParams = {
  email: string;
  code: string;
  newPassword: string;
}

export const resetPassword = async ({ email, code, newPassword }: ResetPasswordParams) => {
  try {
    await axiosInstance.post<{ enabled: boolean }>("/api/auth/reset-password", { email, code, newPassword });
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
