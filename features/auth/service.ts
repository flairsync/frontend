const baseUrl = `${import.meta.env.BASE_URL}/auth`;

const loginUrl = `${baseUrl}/login`;
const logoutUrl = `${baseUrl}/logout`;
import flairapi from "@/lib/flairapi";

export const loginUserApiCall = (data: { email: string; password: string }) => {
  return flairapi.post(
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
    }
  );
};

export const logoutUserApiCall = () => {
  return flairapi.delete(logoutUrl, {
    withCredentials: true,
  });
};
