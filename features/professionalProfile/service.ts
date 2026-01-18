import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/professional-profile`;

const myProfessionalProfileUrl = `${baseUrl}/me`;

export const getMyProfessionalProfileApiCall = () => {
  return flairapi.get(myProfessionalProfileUrl);
};

export type CreateProProfileDto = {
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  workEmail: string;
};

export const createMyProfessionalProfileApiCall = (
  data: CreateProProfileDto
) => {
  return flairapi.post(myProfessionalProfileUrl, data);
};
