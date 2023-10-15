import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export const resendVerify = async ({ email }: {email: string}) => {
  try {
    const response = await axiosInstance.post<{ enabled: boolean }>("/api/auth/resend-verify", { email });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
