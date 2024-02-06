import axiosInstance from "../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../shared/utils/errorMessages.ts";

export type SendResetCodeParams = {
  email: string;
}

export const sendResetCode = async ({ email }: SendResetCodeParams) => {
  try {
    await axiosInstance.post<{ enabled: boolean }>("/api/auth/forgot-password", { email });
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
