const baseUrl = `${import.meta.env.BASE_URL}/auth`;

const loginUrl = `${baseUrl}/login`;
import axios from "axios";

export const loginUserApiCall = (data: { email: string; password: string }) => {
  return axios.post(
    loginUrl,
    {
      email: data.email,
      password: data.password,
    },
    {
      headers: {
        "x-device-id": "device id",
        "x-platform": "windows",
        "x-device-model": "windows 11",
        "x-client-type": "web",
      },
      withCredentials: true,
    }
  );
};
