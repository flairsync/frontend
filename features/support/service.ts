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
  const res = await fetch(`${BASE}/support/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function submitSupportTicket(payload: SupportTicketPayload): Promise<void> {
  const res = await fetch(`${BASE}/support/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    const msg = Array.isArray(err.message) ? err.message.join(', ') : (err.message ?? 'Failed to submit ticket');
    throw new Error(msg);
  }
}
