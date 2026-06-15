import flairapi from "@/lib/flairapi";
import { NotificationRecipient, NotificationPreference } from "./types";
import { unwrap } from "../shared/api-response";

const baseUrl = `${import.meta.env.BASE_URL}/notifications`;

export const getNotificationsApiCall = (limit: number = 20, offset: number = 0) =>
    flairapi.get<NotificationRecipient[]>(baseUrl, { params: { limit, offset } });

export const getUnreadCountApiCall = () =>
    flairapi.get<{ count: number }>(`${baseUrl}/unread-count`);

export const markAsReadApiCall = (id: string) =>
    flairapi.patch<{ success: boolean }>(`${baseUrl}/${id}/read`);

export const markAllAsReadApiCall = () =>
    flairapi.patch<{ success: boolean }>(`${baseUrl}/read-all`);

export const getPreferencesApiCall = () =>
    flairapi.get<NotificationPreference[]>(`${baseUrl}/preferences`);

export const updatePreferencesApiCall = (data: {
    type: 'ALERT' | 'SECURITY' | 'RESERVATION' | 'PROMO' | 'ORDER' |
          'SHIFT_PUBLISHED' | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_SWAP_REQUEST' | 'SHIFT_SWAP_APPROVED' | 'TIME_OFF_REQUEST' | 'TIME_OFF_APPROVED' |
          'INVENTORY_LOW_STOCK' | 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED';
    updates: {
        emailEnabled?: boolean;
        inAppEnabled?: boolean;
        pushEnabled?: boolean;
    }
}) => {
    return flairapi.patch<NotificationPreference>(`${baseUrl}/preferences`, data);
};

export const registerDeviceTokenApiCall = (data: { token: string; deviceType: 'WEB' | 'IOS' | 'ANDROID'; deviceId: string }) => {
    return flairapi.post<{ success: boolean }>(`${baseUrl}/device-tokens`, data);
};

// Preferred logout cleanup: removes by the stable deviceId (backend upserts by this ID)
export const removeDeviceTokenByDeviceIdApiCall = (deviceId: string) => {
    return flairapi.delete<{ success: boolean }>(`${baseUrl}/device-tokens/device/${deviceId}`);
};

// Fallback: remove by FCM token value
export const removeDeviceTokenApiCall = (token: string) => {
    return flairapi.delete<{ success: boolean }>(`${baseUrl}/device-tokens/${token}`);
};
