import axiosInstance from "../../../utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../utils/errorMessages.ts";

export const checkTotpStatus = async ({ email }: {email: string}) => {
  try {
    const response = await axiosInstance.post<{ enabled: boolean }>("/api/auth/totp", { email });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
