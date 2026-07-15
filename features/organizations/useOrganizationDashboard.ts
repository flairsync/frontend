import { useQuery } from "@tanstack/react-query";
import { organizationsApi, OrganizationDashboard } from "./organizations";

export const useOrganizationDashboard = (orgId: string, start: string, end: string) => {
    const { data, isFetching: loadingDashboard, refetch: refreshDashboard } = useQuery<OrganizationDashboard>({
        queryKey: ["organization-dashboard", orgId, start, end],
        queryFn: () => organizationsApi.dashboard(orgId, start, end),
        enabled: !!orgId && !!start && !!end,
    });

    return {
        dashboard: data,
        loadingDashboard,
        refreshDashboard,
    };
};
