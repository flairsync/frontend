import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
const baseUrl = `${import.meta.env.PUBLIC_ENV__BASE_URL}/professional-profile`;

const myProfessionalProfileUrl = `${baseUrl}/me`;

export const getMyProfessionalProfileApiCall = async () =>
  unwrap(await flairapi.get(myProfessionalProfileUrl));

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

export type UpdateProProfileDto = Partial<CreateProProfileDto>;

export const updateMyProfessionalProfileApiCall = (
  data: UpdateProProfileDto
) => {
  return flairapi.patch(myProfessionalProfileUrl, data);
};
