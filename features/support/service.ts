import flairapi from "@/lib/flairapi";
import { extractErrorMessage } from "@/utils/error-utils";

const BASE = 'https://api.flairsync.com/api/v1';

export interface SupportCategory {
  value: string;
  label: string;
}

export interface SupportTicketPayload {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

export async function getSupportCategories(): Promise<SupportCategory[]> {
  // Backend returns a raw array here (not the ApiResponse envelope), so this
  // intentionally reads res.data directly instead of using the unwrap() helper.
  const res = await flairapi.get(`${BASE}/support/categories`);
  return res.data;
}

export async function submitSupportTicket(payload: SupportTicketPayload): Promise<void> {
  try {
    await flairapi.post(`${BASE}/support/contact`, payload);
  } catch (err) {
    throw new Error(extractErrorMessage(err, 'Failed to submit ticket'));
  }
}
