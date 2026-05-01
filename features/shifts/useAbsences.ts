import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AbsenceRecord, CreateAbsenceRecordDto, UpdateAbsenceRecordDto } from "@/models/business/shift/AbsenceRecord";
import {
  createAbsenceRecordApiCall,
  deleteAbsenceRecordApiCall,
  fetchAbsenceRecordsApiCall,
  fetchMyAbsencesApiCall,
  updateAbsenceRecordApiCall,
} from "./service";

export const useAbsences = (businessId: string, employmentId?: string) => {
  const queryClient = useQueryClient();

  const { data: absences = [], isFetching: fetchingAbsences } = useQuery<AbsenceRecord[]>({
    queryKey: ["absences", businessId, employmentId],
    queryFn: async () => {
      try {
        const resp = await fetchAbsenceRecordsApiCall(businessId, employmentId);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(actualData) ? actualData : [];
      } catch {
        return [];
      }
    },
    enabled: !!businessId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAbsenceRecordDto) => createAbsenceRecordApiCall(data),
    onSuccess: () => {
      toast.success("Absence record created");
      queryClient.invalidateQueries({ queryKey: ["absences", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create absence record");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ absenceId, data }: { absenceId: string; data: UpdateAbsenceRecordDto }) =>
      updateAbsenceRecordApiCall(absenceId, data),
    onSuccess: () => {
      toast.success("Absence record updated");
      queryClient.invalidateQueries({ queryKey: ["absences", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update absence record");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (absenceId: string) => deleteAbsenceRecordApiCall(absenceId),
    onSuccess: () => {
      toast.success("Absence record deleted");
      queryClient.invalidateQueries({ queryKey: ["absences", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete absence record");
    },
  });

  return {
    absences,
    fetchingAbsences,
    createAbsence: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateAbsence: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteAbsence: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useMyAbsences = (employmentId: string) => {
  const { data: absences = [], isFetching: fetchingAbsences } = useQuery<AbsenceRecord[]>({
    queryKey: ["my_absences", employmentId],
    queryFn: async () => {
      try {
        const resp = await fetchMyAbsencesApiCall(employmentId);
        const resData = resp.data;
        const actualData = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(actualData) ? actualData : [];
      } catch {
        return [];
      }
    },
    enabled: !!employmentId,
  });

  return { absences, fetchingAbsences };
};
