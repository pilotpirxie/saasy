import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type CheckResetCodeParams = {
  email: string;
  code: string;
}

export const checkResetCode = async ({ email, code }: CheckResetCodeParams) => {
  try {
    await axiosInstance.post<{ enabled: boolean }>("/api/auth/check-reset-code", { email, code });
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
