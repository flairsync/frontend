import flairapi from "@/lib/flairapi";
import { UpdateBusinessDetailsDto } from "@/models/business/MyBusinessFullDetails";
const baseUrl = `${import.meta.env.BASE_URL}`;
const baseBusinessUrl = `${import.meta.env.BASE_URL}/business`;

const getBusinessTagsUrl = `${baseUrl}/business-tags`;
const getBusinessTypesUrl = `${baseUrl}/business-types`;

const createNewBusinessTypesUrl = `${baseBusinessUrl}/new`;
const MyBusinessUrl = `${baseBusinessUrl}/my`;

const updateMyBusinessLogoSuffix = "media/logo";
const updateMyBusinessGallerySuffix = "media/gallery";

const businessOpenHoursSuffix = "open-hours";
// roles

const businessRolesSuffix = "roles";

// Employment
const businessEmploymentsBaseUrl = `${baseUrl}/employments/bus`;

const employeesSuffix = "employees";

// Invitations

const businessInvitationsBaseUrl = `${baseUrl}/business-invitations/businesses`;
const invitationsBaseUrl = `${baseUrl}/business-invitations`;
const invitationsSuffix = "invitations";

// Public business Routes

export const getBusinessTagsApiCall = () => {
  return flairapi.get(getBusinessTagsUrl);
};
export const getBusinessTypesApiCall = () => {
  return flairapi.get(getBusinessTypesUrl);
};

// Private business routes

export const createNewBusinessApiCall = (data: any) => {
  return flairapi.post(createNewBusinessTypesUrl, data);
};

export const fetchMyBusinessesApiCall = (page: number, limit: number) => {
  return flairapi.get(MyBusinessUrl, {
    params: {
      page,
      limit,
    },
  });
};

export const fetchMyBuysinessFullDetailsApiCall = (businessId: string) => {
  return flairapi.get(`${MyBusinessUrl}/${businessId}`);
};

export const updateMyBusinessDetailsApiCall = (
  businessId: string,
  data: UpdateBusinessDetailsDto,
) => {
  return flairapi.patch(`${MyBusinessUrl}/${businessId}`, data);
};

export const updateMyBusinessLogoApiCall = (businessId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  flairapi.post(
    `${MyBusinessUrl}/${businessId}/${updateMyBusinessLogoSuffix}`,
    formData,
  );
};

export type UpdateBusinessGalleryDataType = {
  files: File[];
  delete: string[];
  order: {
    id: string;
    order: number;
  }[];
};

export const updateMyBusienssGalleryApiCall = (
  businessId: string,
  data: UpdateBusinessGalleryDataType,
) => {
  const formData = new FormData();
  // FILES
  data.files.forEach((file: File) => {
    formData.append("files", file);
  });

  // DELETE (array of UUIDs)
  if (data.delete?.length) {
    formData.append("delete", JSON.stringify(data.delete));
  }

  // ORDER
  if (data.order?.length) {
    formData.append("order", JSON.stringify(data.order));
  }

  flairapi.post(
    `${MyBusinessUrl}/${businessId}/${updateMyBusinessGallerySuffix}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const updateMyBusinessOpenHoursApiCall = (
  businessId: string,
  payload: any,
) => {
  return flairapi.patch(
    `${MyBusinessUrl}/${businessId}/${businessOpenHoursSuffix}`,
    payload,
  );
};

// Roles =

export const getBusinessRolesApiCall = (businessId: string) => {
  return flairapi.get(
    `${baseBusinessUrl}/${businessId}/${businessRolesSuffix}`,
  );
};

export type CreateRoleDataType = {
  name: string;
  permissions: {
    permissionKey: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }[];
};

export const createNewBusinessRoleApiCall = (
  businessId: string,
  data: CreateRoleDataType,
) => {
  return flairapi.post(
    `${baseBusinessUrl}/${businessId}/${businessRolesSuffix}`,
    data,
  );
};

export const updateBusinessEmployeeRolesApiCall = (
  businessId: string,
  employeeId: string,
  roleIds: string[],
) => {
  return flairapi.post(
    `${businessEmploymentsBaseUrl}/${businessId}/${employeesSuffix}/${employeeId}`,
    { roleIds },
  );
};

// Employments

export const fetchBusinessEmployeesApiCall = (
  businessId: string,
  page: number = 1,
) => {
  return flairapi.get(
    `${businessEmploymentsBaseUrl}/${businessId}/${employeesSuffix}`,
    {
      params: {
        page: page,
      },
    },
  );
};

//Invitations
export const inviteEmployeeApiCall = (businessId: string, email: string) => {
  return flairapi.post(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}`,
    {
      email: email,
    },
  );
};

export const resendInvitationToEmployeeApiCall = (
  businessId: string,
  inviteId: string,
) => {
  return flairapi.post(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}/${inviteId}/resend`,
  );
};

export const cancelInvitationToEmployeeApiCall = (
  businessId: string,
  inviteId: string,
) => {
  return flairapi.post(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}/${inviteId}/cancel`,
  );
};

export const fetchBusinessEmployeeInvitationsApiCall = (
  businessId: string,
  page: number = 1,
) => {
  return flairapi.get(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}`,
    {
      params: {
        page: page,
      },
    },
  );
};

export const resyncInvitationsApiCall = (businessId: string) => {
  return flairapi.post(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}/resync`,
  );
};

export const fetchInvitationDetailsApiCall = (inviteId: string) => {
  return flairapi.get(`${invitationsBaseUrl}/invitation/${inviteId}`);
};

export const acceptInvitationApiCall = (inviteId: string) => {
  return flairapi.post(`${invitationsBaseUrl}/invitation/${inviteId}/accept`);
};

export const refuseInvitationApiCall = (inviteId: string) => {
  return flairapi.post(`${invitationsBaseUrl}/invitation/${inviteId}/refuse`);
};
