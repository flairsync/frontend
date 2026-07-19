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
  // responseType: 'blob' means an error response body also arrives unparsed as a
  // Blob (not JSON), so there's no structured backend message to extract here —
  // matches the fetchQrPreviewBlob/fetchQrTablesPdfBlob pattern in features/qr/service.ts,
  // which likewise lets the axios error propagate as-is for the caller to handle.
  const res = await flairapi.post(regenerateBackupCodesUrl, undefined, {
    responseType: 'blob',
  });
  return res.data as Blob;
};
