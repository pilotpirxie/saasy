import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type ExchangeCodeParams = {
  code: string;
}

export type ExchangeCodeResponse = {
  accessToken: string;
  refreshToken: string;
}

export const exchangeCode = async ({ code }: ExchangeCodeParams) => {
  try {
    const response = await axiosInstance.post<ExchangeCodeResponse>("/api/auth/exchange", {
      code,
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
