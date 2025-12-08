import { useQuery } from "@tanstack/react-query";
import { getCountriesListApiCall } from "./service";
import { PlatformCountry } from "@/models/shared/PlatformCountry";

export const usePlatformCountries = () => {
  const { data: platformCountries } = useQuery({
    queryKey: ["platform_countries"],
    queryFn: async () => {
      const resp = await getCountriesListApiCall();

      return PlatformCountry.parseApiArrayResponse(resp.data.data);
    },
  });

  return {
    platformCountries,
  };
};
