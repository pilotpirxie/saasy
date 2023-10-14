import axiosInstance from "../../../shared/utils/httpClient.ts";
import { isAxiosError } from "axios";
import { GenericError } from "../../../shared/utils/errorMessages.ts";

export type RegisterParams = {
  email: string;
  password: string;
}

export type RegisterResponse = {
  redirectUrl: string;
}

export const registerByEmail = async ({ email, password }: RegisterParams) => {
  try {
    const response = await axiosInstance.post<RegisterResponse>("/api/auth/register", {
      email: email,
      password: password,
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw new Error(GenericError);
  }
};
