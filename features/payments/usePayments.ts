import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchPaymentAccountApiCall, onboardPaymentAccountApiCall } from "./service";

export const PAYMENT_ACCOUNT_QUERY_KEY = "payment-account";

// The one error code the null adapter returns until a real gateway is wired in
// (src/payments/adapters/null-payment-gateway.adapter.ts on the API) — worth
// distinguishing from a real failure so the page can show "not available yet"
// instead of a scary error toast while this is mid-build.
export const PAYMENT_PROVIDER_NOT_CONFIGURED = "payment_provider.not_configured";

export const usePaymentAccount = (businessId: string) => {
    const { data: paymentAccount, isFetching: fetchingPaymentAccount } = useQuery({
        queryKey: [PAYMENT_ACCOUNT_QUERY_KEY, businessId],
        queryFn: () => fetchPaymentAccountApiCall(businessId),
        enabled: !!businessId,
    });

    return { paymentAccount, fetchingPaymentAccount };
};

export const useOnboardPaymentAccount = (businessId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (returnUrl?: string) => onboardPaymentAccountApiCall(businessId, returnUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PAYMENT_ACCOUNT_QUERY_KEY, businessId] });
        },
        onError: (error: any) => {
            if (error.response?.data?.code === PAYMENT_PROVIDER_NOT_CONFIGURED) return;
            toast.error(error.response?.data?.message ?? "Failed to start MONEI onboarding");
        },
    });

    return mutation;
};
