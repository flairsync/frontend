import flairapi, { API_URL } from "@/lib/flairapi";

export interface LoyaltyBalance {
  enrolled: boolean;
  balance: number;
  enrolledAt?: string;
}

export interface LoyaltySignupInviteResolution {
  valid: boolean;
  businessName?: string;
  contactEmail?: string | null;
  alreadyHasAccount?: boolean;
}

// Any logged-in end-user, no staff permission — the customer checking their
// own balance (used by Diner Mode's loyalty tab).
export const getMyLoyaltyBalanceApiCall = (businessId: string) =>
  flairapi.get<{ data: LoyaltyBalance }>(`${API_URL}/businesses/${businessId}/loyalty/me`);

// Public — the loyalty-signup landing page reads this before deciding whether
// to show a signup form or a "log in to confirm" screen.
export const resolveLoyaltySignupInviteApiCall = (token: string) =>
  flairapi.get<{ data: LoyaltySignupInviteResolution }>(`${API_URL}/loyalty/signup-invite/${token}`);

// Authenticated — used by the "already have an account" confirm path once the
// customer has logged in from the landing page.
export const consumeLoyaltySignupInviteApiCall = (token: string) =>
  flairapi.post(`${API_URL}/loyalty/signup-invite/${token}/consume`);
