import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "@/features/shared/api-response";

const baseUrl = `${API_URL}/platform-settings`;

export type PublicPlatformSettings = {
  betaModeEnabled: boolean;
};

export const fetchPublicPlatformSettingsApiCall = async (): Promise<PublicPlatformSettings> =>
  unwrap(await flairapi.get(`${baseUrl}/public`));
