import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const getWifiUrl = (businessId: string) => {
    return `${API_URL}/businesses/${businessId}/wifi-networks`;
};

export interface WifiNetwork {
    id: string;
    label: string;
    ssid: string;
    password: string;
    businessWide: boolean;
    businessId: string;
    floors: { id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateWifiNetworkDto {
    label: string;
    ssid: string;
    password: string;
    businessWide?: boolean;
    floorIds?: string[];
}

export interface UpdateWifiNetworkDto {
    label?: string;
    ssid?: string;
    password?: string;
    businessWide?: boolean;
    floorIds?: string[];
}

export const fetchWifiNetworksApiCall = async (businessId: string) =>
    unwrap<WifiNetwork[]>(await flairapi.get(getWifiUrl(businessId)));

export const createWifiNetworkApiCall = (businessId: string, data: CreateWifiNetworkDto) => {
    return flairapi.post(getWifiUrl(businessId), data);
};

export const updateWifiNetworkApiCall = (businessId: string, id: string, data: UpdateWifiNetworkDto) => {
    return flairapi.patch(`${getWifiUrl(businessId)}/${id}`, data);
};

export const deleteWifiNetworkApiCall = (businessId: string, id: string) => {
    return flairapi.delete(`${getWifiUrl(businessId)}/${id}`);
};
