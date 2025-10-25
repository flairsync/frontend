import flairapi from "@/lib/flairapi";
const tfaBaseUrl = `${import.meta.env.BASE_URL}/auth/tfa`;
const passwordBaseUrl = `${import.meta.env.BASE_URL}/auth/password`;

const myTfaStatus = `${tfaBaseUrl}/status`;

const initializeTfa = `${tfaBaseUrl}/create`;
const validateTfa = `${tfaBaseUrl}/validate`;
const disableTfa = `${tfaBaseUrl}/disable`;
const checkTfa = `${tfaBaseUrl}/check`;

// password

export type UpdatePasswordDto = {
  password: string;
  newPassword: string;
};

export const updateUserPasswordApiCall = (data: UpdatePasswordDto) => {
  return flairapi.patch(passwordBaseUrl, data);
};

//tfa

export const getTfaStatusApiCall = () => {
  return flairapi.get(myTfaStatus);
};

export const initializeTfaSetupApiCall = () => {
  return flairapi.post(initializeTfa);
};
export const validateTfaSetupApiCall = (code: string) => {
  return flairapi.post(validateTfa, {
    tfaCode: code,
  });
};

export const disableTfaApiCall = (code: string) => {
  return flairapi.patch(disableTfa, {
    tfaCode: code,
  });
};

export const checkTfaApiCall = (code: string) => {
  return flairapi.post(checkTfa, {
    tfaCode: code,
  });
};
