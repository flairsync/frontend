import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNewBusinessApiCall } from "./service";

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
      facebook: input.links?.facebook || undefined,
      instagram: input.links?.instagram || undefined,

      // opening hours
      openingHours: Object.entries(input.workTimes || {}).map(
        ([day, value]: [string, any]) => ({
          day,
          isClosed: value.isClosed ?? false,
          periods: (value.shifts || []).map((shift: any) => ({
            open: shift.open,
            close: shift.close,
          })),
        })
      ),
    };
  }

  const { mutate: createdNewBusiness } = useMutation({
    mutationKey: ["create_new_busienss"],
    mutationFn: async (val: any) => {
      const mapped = mapBusinessFormToCreateBusinessDto(val);
      return createNewBusinessApiCall(mapped);
    },
    onSuccess(data, variables, context) {
      console.log("SUCCESS ----------------------------");
      console.log(data);
      console.log("SUCCESS ----------------------------");
    },
    onError(error, variables, context) {
      console.log("ERROR +++++++++++++++++++++++");
      console.log(error);
      console.log("ERROR +++++++++++++++++++++++");
    },
  });

  return {
    createdNewBusiness,
  };
};
