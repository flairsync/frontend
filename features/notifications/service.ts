import flairapi from "@/lib/flairapi";
import { NotificationRecipient, NotificationPreference } from "./types";

const baseUrl = `${import.meta.env.BASE_URL}/notifications`;

export const getNotificationsApiCall = (limit: number = 20, offset: number = 0) => {
    return flairapi.get<NotificationRecipient[]>(baseUrl, {
        params: { limit, offset }
    });
};

export const getUnreadCountApiCall = () => {
    return flairapi.get<{ count: number }>(`${baseUrl}/unread-count`);
};

export const markAsReadApiCall = (id: string) => {
    return flairapi.patch<{ success: boolean }>(`${baseUrl}/${id}/read`);
};

export const markAllAsReadApiCall = () => {
    return flairapi.patch<{ success: boolean }>(`${baseUrl}/read-all`);
};

export const getPreferencesApiCall = () => {
    return flairapi.get<NotificationPreference[]>(`${baseUrl}/preferences`);
};

export const updatePreferencesApiCall = (data: {
    type: 'ALERT' | 'SECURITY' | 'RESERVATION' | 'PROMO' | 'ORDER' | 
          'SHIFT_PUBLISHED' | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_SWAP_REQUEST' | 'SHIFT_SWAP_APPROVED' | 'TIME_OFF_REQUEST' | 'TIME_OFF_APPROVED';
    updates: {
        emailEnabled?: boolean;
        inAppEnabled?: boolean;
        pushEnabled?: boolean;
    }
}) => {
    return flairapi.patch<NotificationPreference>(`${baseUrl}/preferences`, data);
};

export const registerDeviceTokenApiCall = (data: { token: string; deviceType: 'ios' | 'android' | 'web' }) => {
    return flairapi.post<{ success: boolean }>(`${baseUrl}/device-tokens`, data);
};

export const removeDeviceTokenApiCall = (token: string) => {
    return flairapi.delete<{ success: boolean }>(`${baseUrl}/device-tokens/${token}`);
};
