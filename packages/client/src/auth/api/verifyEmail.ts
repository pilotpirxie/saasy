import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export const verifyEmail = async ({ email, code }: {email: string, code: string}) => {
  try {
    await axiosInstance.post<{ enabled: boolean }>("/api/auth/verify-email", { email, code });
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
