import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchTeamsApiCall,
    createTeamApiCall,
    updateTeamApiCall,
    deleteTeamApiCall,
    assignStaffToTeamApiCall,
    removeStaffFromTeamApiCall,
    CreateTeamPayload,
    UpdateTeamPayload
} from "./service";
import { Team } from "@/models/business/Team";

export const useBusinessTeams = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: teams, isPending: loadingTeams } = useQuery({
        queryKey: ["business_teams", businessId],
        queryFn: async () => {
            const resp = await fetchTeamsApiCall(businessId);
            return Team.parseApiArrayResponse(resp.data.data);
        },
        enabled: !!businessId,
    });

    const { mutateAsync: createTeam, isPending: creatingTeam } = useMutation({
        mutationFn: (payload: CreateTeamPayload) => createTeamApiCall(businessId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_teams", businessId] });
        },
    });

    const { mutateAsync: updateTeam, isPending: updatingTeam } = useMutation({
        mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamPayload }) =>
            updateTeamApiCall(businessId, teamId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_teams", businessId] });
        },
    });

    const { mutateAsync: deleteTeam, isPending: deletingTeam } = useMutation({
        mutationFn: (teamId: string) => deleteTeamApiCall(businessId, teamId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_teams", businessId] });
        },
    });

    const { mutateAsync: assignStaff, isPending: assigningStaff } = useMutation({
        mutationFn: ({ teamId, employmentId }: { teamId: string; employmentId: string }) =>
            assignStaffToTeamApiCall(businessId, teamId, employmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_teams", businessId] });
            // Optionally invalidate employees if it affects other views, though maybe not strictly needed here
            queryClient.invalidateQueries({ queryKey: ["business_emps", businessId] });
        },
    });

    const { mutateAsync: removeStaff, isPending: removingStaff } = useMutation({
        mutationFn: ({ teamId, employmentId }: { teamId: string; employmentId: string }) =>
            removeStaffFromTeamApiCall(businessId, teamId, employmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_teams", businessId] });
            queryClient.invalidateQueries({ queryKey: ["business_emps", businessId] });
        },
    });

    return {
        teams,
        loadingTeams,
        createTeam,
        creatingTeam,
        updateTeam,
        updatingTeam,
        deleteTeam,
        deletingTeam,
        assignStaff,
        assigningStaff,
        removeStaff,
        removingStaff,
    };
};
