import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  applyThemeApiCall,
  fetchThemeCatalogApiCall,
  purchaseThemeApiCall,
} from "./service";

export const useThemeCatalog = (businessId: string | null) => {
  const queryClient = useQueryClient();

  const {
    data: themes,
    isLoading: fetchingThemes,
    isError: themesLoadError,
  } = useQuery({
    queryKey: ["theme_catalog", businessId],
    queryFn: () => {
      if (!businessId) return [];
      return fetchThemeCatalogApiCall(businessId);
    },
    enabled: businessId != null,
  });

  const { mutate: applyTheme, isPending: applyingTheme } = useMutation({
    mutationKey: ["apply_theme", businessId],
    mutationFn: async (themeId: string) => {
      if (!businessId) return;
      return applyThemeApiCall(businessId, themeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme_catalog", businessId] });
      toast.success("Theme applied", {
        description: "Your public site now uses this theme.",
      });
    },
    onError: () => {
      toast.error("Error applying theme", {
        description: "Something went wrong while applying this theme.",
      });
    },
  });

  const { mutate: purchaseTheme, isPending: purchasingTheme } = useMutation({
    mutationKey: ["purchase_theme", businessId],
    mutationFn: async (themeId: string) => {
      if (!businessId) return;
      const { url } = await purchaseThemeApiCall(businessId, themeId);
      return url;
    },
    onSuccess: (url) => {
      if (url && typeof window !== "undefined") {
        window.location.href = url;
      }
    },
    onError: () => {
      toast.error("Error starting checkout", {
        description: "Something went wrong while starting the purchase.",
      });
    },
  });

  return {
    themes: themes ?? [],
    fetchingThemes,
    themesLoadError,
    applyTheme,
    applyingTheme,
    purchaseTheme,
    purchasingTheme,
  };
};
