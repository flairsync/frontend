import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
const baseUrl = `${import.meta.env.BASE_URL}/users`;

const myUserProfileUrl = `${baseUrl}/me`;

export const getUserProfileApiCall = async () =>
  unwrap(await flairapi.get(myUserProfileUrl));

export type UpdateUserProfileDTO = {
  firstName?: string;
  lastName?: string;
  language?: string;
  marketingEmail?: boolean;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  countryId?: number | null;
};

export const updateUserProfileApiCall = (data: UpdateUserProfileDTO) => {
  return flairapi.patch(myUserProfileUrl, data);
};


export const getPublicUserDisplayName = async (userId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/${userId}/display-name`));

export const requestAccountDeletionApiCall = () => {
  return flairapi.delete(myUserProfileUrl);
};

export const cancelAccountDeletionApiCall = () => {
  return flairapi.post(`${myUserProfileUrl}/cancel-deletion`);
};

export const requestDataExportApiCall = () => {
  return flairapi.post(`${myUserProfileUrl}/data-export`);
};

export const getDataExportStatusApiCall = async () =>
  unwrap(await flairapi.get(`${myUserProfileUrl}/data-export/status`));