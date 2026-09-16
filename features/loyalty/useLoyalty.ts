import { useQuery } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import {
    getMyLoyaltyBalanceApiCall,
    LoyaltyBalance,
    getMyLoyaltyAccountsApiCall,
    MyLoyaltyAccount,
    getMyLoyaltyHistoryApiCall,
    LoyaltyHistoryPage,
} from "./loyalty-api";

export const useMyLoyaltyBalance = (businessId: string | undefined) => {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

    return useQuery({
        queryKey: ["diner_loyalty_balance", businessId],
        queryFn: async (): Promise<LoyaltyBalance> => {
            const res = await getMyLoyaltyBalanceApiCall(businessId!);
            return res.data.data;
        },
        // Balance only exists for a logged-in account — guests are shown a
        // static "ask staff to join" message instead of querying this at all.
        enabled: !!businessId && isLoggedIn,
        refetchInterval: 5 * 60_000,
    });
};

// Every business's loyalty program the logged-in user has joined — powers the
// "My Loyalty Cards" profile page.
export const useMyLoyaltyAccounts = () => {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

    return useQuery({
        queryKey: ["my_loyalty_accounts"],
        queryFn: async (): Promise<MyLoyaltyAccount[]> => (await getMyLoyaltyAccountsApiCall()).data.data,
        enabled: isLoggedIn,
    });
};

// The customer's own transaction history at one business — powers the
// "Recent Activity" list on Diner Mode's loyalty tab.
export const useMyLoyaltyHistory = (businessId: string | undefined, page: number, limit = 10) => {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;

    return useQuery({
        queryKey: ["my_loyalty_history", businessId, page, limit],
        queryFn: async (): Promise<LoyaltyHistoryPage> => (await getMyLoyaltyHistoryApiCall(businessId!, page, limit)).data.data,
        enabled: !!businessId && isLoggedIn,
    });
};
