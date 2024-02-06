import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type LoginParams = {
  email: string;
  password: string;
  totp?: string;
}

export type LoginResponse = {
  redirectUrl: string;
}

export const loginByEmail = async ({ email, password, totp }: LoginParams) => {
  try {
    const response = await axiosInstance.post<LoginResponse>("/api/auth/login", {
      email: email,
      password: password,
      totpCode: totp || undefined,
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
