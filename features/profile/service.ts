import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/users`;

const myUserProfileUrl = `${baseUrl}/me`;

export const getUserProfileApiCall = () => {
  return flairapi.get(myUserProfileUrl);
};

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
