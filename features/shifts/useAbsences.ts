import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AbsenceRecord, CreateAbsenceRecordDto, UpdateAbsenceRecordDto } from "@/models/business/shift/AbsenceRecord";
import {
  createAbsenceRecordApiCall,
  deleteAbsenceRecordApiCall,
  fetchAbsenceRecordsApiCall,
  fetchMyAbsencesApiCall,
  lockAbsenceRecordApiCall,
  unlockAbsenceRecordApiCall,
  updateAbsenceRecordApiCall,
} from "./service";

export const useAbsences = (businessId: string, employmentId?: string) => {
  const queryClient = useQueryClient();

  const { data: absences = [], isFetching: fetchingAbsences } = useQuery<AbsenceRecord[]>({
    queryKey: ["absences", businessId, employmentId],
    queryFn: async () => {
      try {
        const data = await fetchAbsenceRecordsApiCall(businessId, employmentId);
        return Array.isArray(data) ? data : [];
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
    mutationFn: (absenceId: string) => deleteAbsenceRecordApiCall(absenceId, businessId),
    onSuccess: () => {
      toast.success("Absence record deleted");
      queryClient.invalidateQueries({ queryKey: ["absences", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete absence record");
    },
  });

  const lockMutation = useMutation({
    mutationFn: (absenceId: string) => lockAbsenceRecordApiCall(absenceId, businessId),
    onSuccess: () => {
      toast.success("Absence record locked");
      queryClient.invalidateQueries({ queryKey: ["absences", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to lock absence record");
    },
  });

  const unlockMutation = useMutation({
    mutationFn: (absenceId: string) => unlockAbsenceRecordApiCall(absenceId, businessId),
    onSuccess: () => {
      toast.success("Absence record unlocked");
      queryClient.invalidateQueries({ queryKey: ["absences", businessId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unlock absence record");
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
    lockAbsence: lockMutation.mutate,
    isLocking: lockMutation.isPending,
    unlockAbsence: unlockMutation.mutate,
    isUnlocking: unlockMutation.isPending,
  };
};

export const useMyAbsences = (employmentId: string) => {
  const { data: absences = [], isFetching: fetchingAbsences } = useQuery<AbsenceRecord[]>({
    queryKey: ["my_absences", employmentId],
    queryFn: async () => {
      try {
        const data = await fetchMyAbsencesApiCall(employmentId);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: !!employmentId,
  });

  return { absences, fetchingAbsences };
};
