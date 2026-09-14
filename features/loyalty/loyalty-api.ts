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

export interface LoyaltyProgram {
  businessId: string;
  pointsPerCurrencyUnit: string | null;
  isActive: boolean;
}

export interface UpsertLoyaltyProgramDto {
  pointsPerCurrencyUnit: string;
  isActive: boolean;
}

const getLoyaltyProgramUrl = (businessId: string) => `${API_URL}/businesses/${businessId}/loyalty/program`;

// Owner/staff-facing config — 403s if the business's Pack doesn't include the
// "loyalty_points" feature flag (see LoyaltyService.hasLoyaltyAccess).
export const getLoyaltyProgramApiCall = (businessId: string) =>
  flairapi.get<{ data: LoyaltyProgram }>(getLoyaltyProgramUrl(businessId));

export const upsertLoyaltyProgramApiCall = (businessId: string, dto: UpsertLoyaltyProgramDto) =>
  flairapi.put<{ data: LoyaltyProgram }>(getLoyaltyProgramUrl(businessId), dto);

// Any logged-in end-user, no staff permission — the customer checking their
// own balance (used by Diner Mode's loyalty tab).
export const getMyLoyaltyBalanceApiCall = (businessId: string) =>
  flairapi.get<{ data: LoyaltyBalance }>(`${API_URL}/businesses/${businessId}/loyalty/me`);

// Self-serve join via the "Join our Loyalty Program" QR code — any logged-in
// end-user, no invite token required.
export const joinLoyaltyProgramApiCall = (businessId: string) =>
  flairapi.post(`${API_URL}/businesses/${businessId}/loyalty/join`);

export interface MyLoyaltyAccount {
  businessId: string;
  businessName: string;
  businessLogo?: string | null;
  balance: number;
  enrolledAt: string;
}

// Every loyalty program the logged-in user has joined, across every business
// — powers the "My Loyalty Cards" profile page.
export const getMyLoyaltyAccountsApiCall = () =>
  flairapi.get<{ data: MyLoyaltyAccount[] }>(`${API_URL}/loyalty/accounts`);

// Public — the loyalty-signup landing page reads this before deciding whether
// to show a signup form or a "log in to confirm" screen.
export const resolveLoyaltySignupInviteApiCall = (token: string) =>
  flairapi.get<{ data: LoyaltySignupInviteResolution }>(`${API_URL}/loyalty/signup-invite/${token}`);

// Authenticated — used by the "already have an account" confirm path once the
// customer has logged in from the landing page.
export const consumeLoyaltySignupInviteApiCall = (token: string) =>
  flairapi.post(`${API_URL}/loyalty/signup-invite/${token}/consume`);
