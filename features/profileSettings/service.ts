import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
const tfaBaseUrl = `${'https://api.flairsync.com/api/v1'}/auth/tfa`;
const passwordBaseUrl = `${'https://api.flairsync.com/api/v1'}/auth/password`;

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

export const getTfaStatusApiCall = async (): Promise<any> =>
  unwrap(await flairapi.get(myTfaStatus));

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

const regenerateBackupCodesUrl = `${tfaBaseUrl}/backup-codes/regenerate`;

export const regenerateBackupCodesApiCall = async (): Promise<Blob> => {
  const res = await fetch(regenerateBackupCodesUrl, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to regenerate backup codes' }));
    throw new Error(err.message || 'Failed to regenerate backup codes');
  }
  return res.blob();
};
