import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  fetchRecurringRulesApiCall,
  createRecurringRuleApiCall,
  updateRecurringRuleApiCall,
  deleteRecurringRuleApiCall
} from "./service";
import { RecurringShiftRule } from "@/models/business/shift/RecurringShiftRule";

const formatToDateOnly = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
};

export const useRecurringRules = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: rules, isFetching: fetchingRules } = useQuery<RecurringShiftRule[]>({
    queryKey: ["recurring_rules", businessId],
    queryFn: async () => {
      try {
        const resp = await fetchRecurringRulesApiCall(businessId);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(actualData) ? actualData : [];
      } catch (error) {
        console.warn("Failed to fetch recurring rules:", error);
        return [];
      }
    },
    enabled: !!businessId,
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: Omit<RecurringShiftRule, "id" | "businessId">) =>
      createRecurringRuleApiCall({ 
        ...data, 
        businessId,
        startDate: formatToDateOnly(data.startDate),
        endDate: data.endDate ? formatToDateOnly(data.endDate) : null,
        interval: data.interval || 1
      }),
    onSuccess: () => {
      toast.success("Recurring rule created successfully");
      queryClient.invalidateQueries({ queryKey: ["recurring_rules", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create recurring rule";
      toast.error(msg);
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: Partial<RecurringShiftRule> }) =>
      updateRecurringRuleApiCall(ruleId, {
        ...data,
        startDate: data.startDate ? formatToDateOnly(data.startDate) : undefined,
        endDate: data.endDate ? formatToDateOnly(data.endDate) : undefined, // Could be null
      }),
    onSuccess: () => {
      toast.success("Recurring rule updated successfully");
      queryClient.invalidateQueries({ queryKey: ["recurring_rules", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update recurring rule";
      toast.error(msg);
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => deleteRecurringRuleApiCall(ruleId),
    onSuccess: () => {
      toast.success("Recurring rule deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["recurring_rules", businessId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to delete recurring rule";
      toast.error(msg);
    }
  });

  return {
    rules,
    fetchingRules,
    createRule: createRuleMutation.mutate,
    isCreatingRule: createRuleMutation.isPending,
    updateRule: updateRuleMutation.mutate,
    isUpdatingRule: updateRuleMutation.isPending,
    deleteRule: deleteRuleMutation.mutate,
    isDeletingRule: deleteRuleMutation.isPending,
  };
};
