import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type CheckEmailStatusParams = {
  email: string;
}

export const checkEmailStatus = async ({ email }: CheckEmailStatusParams) => {
  try {
    return await axiosInstance.post<{ enabled: boolean }>("/api/auth/email-status", { email });
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
