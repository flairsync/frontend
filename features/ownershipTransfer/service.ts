import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/business-ownership-transfers`;

export type InitiateOwnershipTransferData = {
  newOwnerEmail: string;
  password: string;
  twoFactorCode?: string;
};

export const initiateOwnershipTransferApiCall = (
  businessId: string,
  data: InitiateOwnershipTransferData,
) => {
  return flairapi.post(`${baseUrl}/businesses/${businessId}`, data);
};

export const getActiveOwnershipTransferApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${baseUrl}/businesses/${businessId}`));

export const getOwnershipTransferByTokenApiCall = async (token: string) =>
  unwrap(await flairapi.get(`${baseUrl}/${token}`));

export const confirmOwnershipTransferApiCall = (token: string) => {
  return flairapi.post(`${baseUrl}/${token}/confirm`);
};

export const cancelOwnershipTransferApiCall = (token: string) => {
  return flairapi.post(`${baseUrl}/${token}/cancel`);
};
