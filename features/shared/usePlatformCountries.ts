import { useQuery } from "@tanstack/react-query";
import { getCountriesListApiCall } from "./service";
import { PlatformCountry } from "@/models/shared/PlatformCountry";

export const usePlatformCountries = ({ includeAll = false }: { includeAll?: boolean } = {}) => {
  const { data: platformCountries, isLoading: isCountriesLoading } = useQuery({
    queryKey: ["platform_countries", includeAll],
    queryFn: async () => {
      const data = await getCountriesListApiCall(includeAll);
      return PlatformCountry.parseApiArrayResponse(data);
    },
  });

  return {
    platformCountries,
    isCountriesLoading
  };
};
