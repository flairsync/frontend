import { useQuery } from "@tanstack/react-query";
import { organizationsApi, OrganizationDetail } from "./organizations";

export const useOrganizationDetail = (orgId: string) => {
    const { data, isFetching: loadingOrganization, refetch: refreshOrganization } = useQuery<OrganizationDetail>({
        queryKey: ["organization", orgId],
        queryFn: () => organizationsApi.detail(orgId),
        enabled: !!orgId,
    });

    return {
        organization: data?.organization,
        businesses: data?.businesses || [],
        regions: data?.regions || [],
        loadingOrganization,
        refreshOrganization,
    };
};
