import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getLoyaltyProgramApiCall,
    upsertLoyaltyProgramApiCall,
    LoyaltyProgram,
    UpsertLoyaltyProgramDto,
} from "./loyalty-api";

export const useLoyaltyProgram = (businessId: string) => {
    const queryClient = useQueryClient();

    const {
        data: program,
        isFetching: fetchingProgram,
        error: programError,
    } = useQuery({
        queryKey: ["loyalty-program", businessId],
        queryFn: async (): Promise<LoyaltyProgram> => (await getLoyaltyProgramApiCall(businessId)).data.data,
        enabled: !!businessId,
        // A 403 (Pack doesn't include loyalty_points) is a normal, expected
        // state here — the page renders a locked-feature card for it, not a
        // retry loop.
        retry: false,
    });

    const { mutate: saveProgram, isPending: savingProgram } = useMutation({
        mutationFn: (dto: UpsertLoyaltyProgramDto) => upsertLoyaltyProgramApiCall(businessId, dto),
        onSuccess: () => {
            toast.success("Loyalty program saved");
            queryClient.invalidateQueries({ queryKey: ["loyalty-program", businessId] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? "Couldn't save the loyalty program");
        },
    });

    return {
        program,
        fetchingProgram,
        programError,
        isLocked: (programError as any)?.response?.status === 403,
        saveProgram,
        savingProgram,
    };
};
