import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/auth`;

const loginUrl = `${baseUrl}/login`;
const googleAuthUrl = `${baseUrl}/google`;
const registerUrl = `${baseUrl}/register`;
const logoutUrl = `${baseUrl}/logout`;

const sessionsUrl = `${baseUrl}/sessions`;

const resendVerificationEmailUrl = `${baseUrl}/resend-email-otp`;
const verifyEmailUrl = `${baseUrl}/verify-email`;

export const loginUserWithGoogleApiCall = (tokenId: string) => {
  return flairapi.post(
    googleAuthUrl,
    {
      tokenId,
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

export const signupUserApiCall = (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  return flairapi.post(registerUrl, {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
  });
};

export const logoutUserApiCall = () => {
  return flairapi.delete(logoutUrl, {
    withCredentials: true,
  });
};

// sessions

export const getUserSessionsApiCall = () => {
  return flairapi.get(sessionsUrl);
};

export type DisconnectSessionData = {
  sessionId: string;
};
export const disconnectUserSessionsApiCall = (data: DisconnectSessionData) => {
  return flairapi.delete(`${sessionsUrl}/${data.sessionId}`);
};

// verification

export const resendVerificationOtpApiCall = () => {
  return flairapi.get(resendVerificationEmailUrl);
};
export const verifyEmailOtpApiCall = (otp: string) => {
  return flairapi.post(verifyEmailUrl, {
    otp,
  });
};
