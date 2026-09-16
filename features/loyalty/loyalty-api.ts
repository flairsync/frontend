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
  expiryMonths: number | null;
}

export interface UpsertLoyaltyProgramDto {
  pointsPerCurrencyUnit: string;
  isActive: boolean;
  expiryMonths?: number | null;
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

export interface LoyaltyMember {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  balance: number;
  enrolledAt: string;
}

export interface LoyaltyMembersPage {
  data: LoyaltyMember[];
  current: number;
  pages: number;
}

export interface LoyaltyStats {
  memberCount: number;
  pointsOutstanding: number;
  pointsIssued: number;
}

// Owner/staff dashboard — paginated member list.
export const getLoyaltyMembersApiCall = (businessId: string, page: number, limit: number) =>
  flairapi.get<{ data: LoyaltyMembersPage }>(
    `${API_URL}/businesses/${businessId}/loyalty/members`,
    { params: { page, limit } },
  );

// Owner/staff dashboard — summary stats.
export const getLoyaltyStatsApiCall = (businessId: string) =>
  flairapi.get<{ data: LoyaltyStats }>(`${API_URL}/businesses/${businessId}/loyalty/stats`);

// Staff correction to a member's balance — dispute fix or goodwill gesture.
export const adjustLoyaltyPointsApiCall = (businessId: string, userId: string, delta: number, note?: string) =>
  flairapi.post<{ data: { balance: number } }>(
    `${API_URL}/businesses/${businessId}/loyalty/members/${userId}/adjust`,
    { delta, note },
  );

export type LoyaltyLedgerReason = "EARN_ORDER" | "MANUAL_ADJUSTMENT" | "EXPIRY";

export interface LoyaltyHistoryEntry {
  id: string;
  delta: number;
  reason: LoyaltyLedgerReason;
  note?: string | null;
  orderId?: string | null;
  createdAt: string;
}

export interface LoyaltyHistoryPage {
  data: LoyaltyHistoryEntry[];
  current: number;
  pages: number;
}

// Any logged-in end-user, no staff permission — the customer's own
// transaction history at this business (Diner Mode).
export const getMyLoyaltyHistoryApiCall = (businessId: string, page: number, limit: number) =>
  flairapi.get<{ data: LoyaltyHistoryPage }>(
    `${API_URL}/businesses/${businessId}/loyalty/me/history`,
    { params: { page, limit } },
  );

// Owner/staff dashboard — one member's transaction history (dispute/support lookups).
export const getLoyaltyMemberHistoryApiCall = (businessId: string, userId: string, page: number, limit: number) =>
  flairapi.get<{ data: LoyaltyHistoryPage }>(
    `${API_URL}/businesses/${businessId}/loyalty/members/${userId}/history`,
    { params: { page, limit } },
  );
