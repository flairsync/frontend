import { useQuery } from "@tanstack/react-query";
import { fetchPublicPlatformSettingsApiCall } from "./service";

// Unauthenticated — safe to call from public pages, auth/signup screens, and
// the manage dashboard alike, so the beta banner can mount everywhere.
export const usePublicPlatformSettings = () =>
  useQuery({
    queryKey: ["platform-settings", "public"],
    queryFn: fetchPublicPlatformSettingsApiCall,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
