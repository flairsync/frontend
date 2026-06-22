import flairapi from "@/lib/flairapi";
import { UpdateBusinessDetailsDto } from "@/models/business/MyBusinessFullDetails";
import { unwrap, unwrapPaginated } from "../shared/api-response";
const baseUrl = `${'https://api.flairsync.com/api/v1'}`;
const baseBusinessUrl = `${'https://api.flairsync.com/api/v1'}/business`;

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
const myEmploymentsUrl = `${baseUrl}/employments/me`;

const employeesSuffix = "employees";

// Invitations

const businessInvitationsBaseUrl = `${baseUrl}/business-invitations/businesses`;
const invitationsBaseUrl = `${baseUrl}/business-invitations`;
const invitationsSuffix = "invitations";

// Public business Routes

export const getBusinessTagsApiCall = async () =>
  unwrap(await flairapi.get(getBusinessTagsUrl));

export const getBusinessTypesApiCall = async () =>
  unwrap(await flairapi.get(getBusinessTypesUrl));

// Private business routes

export const createNewBusinessApiCall = (data: any) => {
  return flairapi.post(createNewBusinessTypesUrl, data);
};

export const fetchMyBusinessesApiCall = async (page: number, limit: number) =>
  unwrapPaginated(await flairapi.get(MyBusinessUrl, { params: { page, limit } }));

export const fetchMyBuysinessFullDetailsApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${MyBusinessUrl}/${businessId}`));

export const fetchBusinessBasicDetailsApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${baseBusinessUrl}/${businessId}/basic-details`));

export const updateMyBusinessDetailsApiCall = (
  businessId: string,
  data: UpdateBusinessDetailsDto,
) => {
  return flairapi.patch(`${MyBusinessUrl}/${businessId}`, data);
};

export const updateMyBusinessLogoApiCall = (businessId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return flairapi.post(
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

  return flairapi.post(
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

export const getBusinessRolesApiCall = async (businessId: string) =>
  unwrapPaginated(await flairapi.get(`${baseBusinessUrl}/${businessId}/${businessRolesSuffix}`));

export type CreateRoleDataType = {
  name: string;
  permissions: {
    permissionKey: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }[];
  posAccess?: boolean;
  kdsAccess?: boolean;
  posCreateOrder?: boolean;
  posVoidItem?: boolean;
  posCancelOrder?: boolean;
  posRefund?: boolean;
  posApplyDiscount?: boolean;
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

export const updateBusinessRoleApiCall = (
  businessId: string,
  roleId: string,
  data: CreateRoleDataType,
) => {
  return flairapi.put(
    `${baseBusinessUrl}/${businessId}/${businessRolesSuffix}/${roleId}`,
    data,
  );
};

export const deleteBusinessRoleApiCall = (
  businessId: string,
  roleId: string,
) => {
  return flairapi.delete(
    `${baseBusinessUrl}/${businessId}/${businessRolesSuffix}/${roleId}`,
  );
};

export const updateBusinessRolePermissionApiCall = (
  businessId: string,
  roleId: string,
  data: {
    permissionKey: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }
) => {
  return flairapi.post(
    `${baseBusinessUrl}/${businessId}/${businessRolesSuffix}/${roleId}/permissions`,
    data,
  );
};

export const deleteBusinessRolePermissionApiCall = (
  businessId: string,
  roleId: string,
  permissionKey: string,
) => {
  return flairapi.delete(
    `${baseBusinessUrl}/${businessId}/${businessRolesSuffix}/${roleId}/permissions/${permissionKey}`,
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

export const updateBusinessEmployeeHourlyRateApiCall = (
  businessId: string,
  employeeId: string,
  hourlyRate: number,
) => {
  return flairapi.patch(
    `${businessEmploymentsBaseUrl}/${businessId}/${employeesSuffix}/${employeeId}/rate`,
    { hourlyRate },
  );
};

export const updateBusinessEmployeeSettingsApiCall = (
  businessId: string,
  employeeId: string,
  data: any,
) => {
  return flairapi.patch(
    `${businessEmploymentsBaseUrl}/${businessId}/${employeesSuffix}/${employeeId}`,
    data
  );
};

// Employments

export const fetchBusinessEmployeesApiCall = async (businessId: string, page: number = 1, limit?: number) =>
  unwrapPaginated(await flairapi.get(
    `${businessEmploymentsBaseUrl}/${businessId}/${employeesSuffix}`,
    { params: { page, limit } },
  ));

export const fetchMyEmploymentsApiCall = async (page: number = 1, limit: number = 10) =>
  unwrapPaginated(await flairapi.get(myEmploymentsUrl, { params: { page, limit } }));

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

export const fetchBusinessEmployeeInvitationsApiCall = async (businessId: string, page: number = 1) =>
  unwrapPaginated(await flairapi.get(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}`,
    { params: { page } },
  ));

export const resyncInvitationsApiCall = (businessId: string) => {
  return flairapi.post(
    `${businessInvitationsBaseUrl}/${businessId}/${invitationsSuffix}/resync`,
  );
};

export const fetchMyInvitationsApiCall = async () =>
  unwrap(await flairapi.get(`${invitationsBaseUrl}/invitations/me`));

export const fetchInvitationDetailsApiCall = async (inviteId: string) =>
  unwrap(await flairapi.get(`${invitationsBaseUrl}/invitation/${inviteId}`));

export const acceptInvitationApiCall = (inviteToken: string) => {
  return flairapi.post(`${invitationsBaseUrl}/invitation/${inviteToken}/accept`);
};

export const refuseInvitationApiCall = (inviteToken: string) => {
  return flairapi.post(`${invitationsBaseUrl}/invitation/${inviteToken}/decline`);
};

export const deleteMyBusinessApiCall = (businessId: string) => {
  return flairapi.delete(`${MyBusinessUrl}/${businessId}`);
};

export const bulkAssignRoleToEmployeesApiCall = (
  businessId: string,
  roleId: string,
  employmentIds: string[],
) => {
  return flairapi.post(
    `${businessEmploymentsBaseUrl}/${businessId}/${roleId}/assign`,
    { employmentIds },
  );
};

export const fetchBusinessPlanApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${MyBusinessUrl}/${businessId}/plan`));
