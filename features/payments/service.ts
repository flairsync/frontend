import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const getPaymentAccountUrl = (businessId: string) => `${API_URL}/businesses/${businessId}/payment-account`;
const getOrdersUrl = (businessId: string) => `${API_URL}/businesses/${businessId}/orders`;

export type PaymentProvider = "monei";
export type PaymentAccountStatus = "pending" | "active" | "rejected";

export interface BusinessPaymentAccount {
    id: string;
    businessId: string;
    provider: PaymentProvider;
    externalAccountId: string | null;
    status: PaymentAccountStatus;
    onboardingUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export const fetchPaymentAccountApiCall = async (businessId: string) =>
    unwrap<BusinessPaymentAccount | null>(await flairapi.get(getPaymentAccountUrl(businessId)));

export const onboardPaymentAccountApiCall = async (businessId: string, returnUrl?: string) =>
    unwrap<BusinessPaymentAccount>(
        await flairapi.post(`${getPaymentAccountUrl(businessId)}/onboard`, returnUrl ? { returnUrl } : {}),
    );

export const createOnlineChargeApiCall = async (businessId: string, orderId: string) =>
    unwrap<{ externalPaymentId: string; checkoutUrl: string }>(
        await flairapi.post(`${getOrdersUrl(businessId)}/${orderId}/payments/online`),
    );
