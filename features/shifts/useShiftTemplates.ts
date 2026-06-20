import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchShiftTemplatesApiCall,
  createShiftTemplateApiCall,
  updateShiftTemplateApiCall,
  deleteShiftTemplateApiCall,
  CreateShiftTemplateDto,
  UpdateShiftTemplateDto
} from "./service";
import { ShiftTemplate } from "@/models/business/shift/ShiftTemplate";

export const useShiftTemplates = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: templates, isFetching: fetchingTemplates, refetch } = useQuery<ShiftTemplate[]>({
    queryKey: ["shift-templates", businessId],
    queryFn: async () => {
      try {
        const data = await fetchShiftTemplatesApiCall(businessId);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn("Failed to fetch shift templates:", error);
        return [];
      }
    },
    enabled: !!businessId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: Omit<CreateShiftTemplateDto, "businessId">) =>
      createShiftTemplateApiCall({ ...data, businessId }),
    onSuccess: () => {
      toast.success("Shift template created successfully");
      queryClient.invalidateQueries({ queryKey: ["shift-templates", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create shift template";
      toast.error(msg);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UpdateShiftTemplateDto }) =>
      updateShiftTemplateApiCall(templateId, businessId, data),
    onSuccess: () => {
      toast.success("Shift template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["shift-templates", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update shift template";
      toast.error(msg);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => deleteShiftTemplateApiCall(templateId, businessId),
    onSuccess: () => {
      toast.success("Shift template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["shift-templates", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to delete shift template";
      toast.error(msg);
    }
  });

  return {
    templates,
    fetchingTemplates,
    refetchTemplates: refetch,
    createTemplate: createTemplateMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    updateTemplate: updateTemplateMutation.mutate,
    isUpdatingTemplate: updateTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeletingTemplate: deleteTemplateMutation.isPending,
  };
};
