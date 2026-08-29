import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { BusinessAlert } from "./types";

const getAlertsUrl = (businessId: string) => `${API_URL}/businesses/${businessId}/alerts`;

export const fetchAlertsApiCall = async (businessId: string) =>
    unwrap<{ alerts: BusinessAlert[]; count: number }>(await flairapi.get(getAlertsUrl(businessId)));
