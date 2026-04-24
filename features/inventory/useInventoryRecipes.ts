import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    setMenuItemRecipeApiCall,
    getMenuItemRecipeApiCall,
    deleteRecipeIngredientApiCall,
    SetRecipeDto,
} from "./service";
import { toast } from "sonner";

export const useInventoryRecipes = (businessId: string, menuItemId: string | null) => {
    const queryClient = useQueryClient();

    const {
        data: recipe,
        isFetching: fetchingRecipe,
        refetch: refreshRecipe,
    } = useQuery({
        queryKey: ["inventory_recipe", businessId, menuItemId],
        queryFn: async () => {
            const resp = await getMenuItemRecipeApiCall(businessId, menuItemId!);
            const data = resp.data?.data !== undefined ? resp.data.data : resp.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: !!businessId && !!menuItemId,
        staleTime: 1000 * 60 * 5,
    });

    const setRecipeMutation = useMutation({
        mutationFn: ({ menuItemId: id, data }: { menuItemId: string; data: SetRecipeDto }) =>
            setMenuItemRecipeApiCall(businessId, id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["inventory_recipe", businessId, variables.menuItemId] });
            toast.success("Recipe saved successfully");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to save recipe";
            toast.error(msg);
        },
    });

    const deleteIngredientMutation = useMutation({
        mutationFn: (recipeId: string) => deleteRecipeIngredientApiCall(businessId, recipeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_recipe", businessId, menuItemId] });
            toast.success("Ingredient removed");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to remove ingredient";
            toast.error(msg);
        },
    });

    return {
        recipe: recipe ?? [],
        fetchingRecipe,
        refreshRecipe,
        setRecipe: setRecipeMutation.mutateAsync,
        isSettingRecipe: setRecipeMutation.isPending,
        deleteIngredient: deleteIngredientMutation.mutate,
        isDeletingIngredient: deleteIngredientMutation.isPending,
    };
};
