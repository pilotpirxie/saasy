import axios from "axios";
import config from "../../config.ts";

const axiosInstance = axios.create({
  baseURL: config.baseUrl,
  timeout: 3000,
  headers: {
    "Cache-Control": "no-cache",
  },
});

axiosInstance.interceptors.request.use((requestConfig) => {
  return requestConfig;
});

axiosInstance.interceptors.response.use((response) => {
  if (response.status === 400 || response.status === 500) {
    console.warn(response);
  }

  return response;
});

export default axiosInstance;
