import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNewBusinessApiCall } from "./service";
import { normalizeUrl } from "@/utils/url-utils";

export const useBusinessOps = () => {
  const queryClient = useQueryClient();

  function mapBusinessFormToCreateBusinessDto(input: any) {
    return {
      name: input.name,
      description: input.description ?? undefined,

      // relations
      typeId: Number(input.type),
      countryId: input.location?.country?.id,

      // pricing ($ -> 1..5)
      priceLevel: (() => {
        switch (input.pricing) {
          case "$":
            return 1;
          case "$$":
            return 2;
          case "$$$":
            return 3;
          case "$$$$":
            return 4;
          case "$$$$$":
            return 5;
          default:
            return 1;
        }
      })(),

      // tags
      tagIds: Array.isArray(input.tags) ? input.tags.map((t: any) => t.id) : [],

      // location
      city: input.location?.city ?? undefined,
      address: input.location?.address ?? undefined,
      lat: input.location?.lat ?? undefined,
      lng: input.location?.lng ?? undefined,

      // social links
      // P1-8 (QA round 6, 2026-11-20): website was never included here at all (facebook/
      // instagram were), so it was silently dropped on submit regardless of normalization.
      facebook: normalizeUrl(input.links?.facebook),
      instagram: normalizeUrl(input.links?.instagram),
      website: normalizeUrl(input.links?.website),

      // opening hours
      openingHours: (input.workTimes || []).map(
        (value: any) => ({
          day: value.day,
          isClosed: value.isClosed ?? false,
          periods: (value.periods || []).map((period: any) => ({
            open: period.open,
            close: period.close,
          })),
        })
      ),

      // auto-creation engine
      tableCount: input.tableCount ?? 10,
      hasKitchen: input.hasKitchen ?? true,
      autoSetup: input.autoSetup ?? false,

      // status
      status: "auto",
      // timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  const { mutate: createdNewBusiness } = useMutation({
    mutationKey: ["create_new_busienss"],
    mutationFn: async (val: any) => {
      const mapped = mapBusinessFormToCreateBusinessDto(val);
      return createNewBusinessApiCall(mapped);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["my_businesses"] });
    },
    onError(error, variables, context) { },
  });

  return {
    createdNewBusiness,
  };
};
