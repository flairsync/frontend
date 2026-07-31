import flairapi from "@/lib/flairapi";
import { unwrap } from "@/features/shared/api-response";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/platform-settings`;

export type PublicPlatformSettings = {
  betaModeEnabled: boolean;
};

export const fetchPublicPlatformSettingsApiCall = async (): Promise<PublicPlatformSettings> =>
  unwrap(await flairapi.get(`${baseUrl}/public`));
