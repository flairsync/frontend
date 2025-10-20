import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/auth/tfa`;

const myTfaStatus = `${baseUrl}/status`;
const initializeTfa = `${baseUrl}/create`;
const validateTfa = `${baseUrl}/validate`;

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
