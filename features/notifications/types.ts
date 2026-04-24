export interface NotificationPayload {
    id: string; // UUID
    type: 'ALERT' | 'SECURITY' | 'RESERVATION' | 'PROMO' | 'ORDER' |
          'SHIFT_PUBLISHED' | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_SWAP_REQUEST' | 'SHIFT_SWAP_APPROVED' | 'TIME_OFF_REQUEST' | 'TIME_OFF_APPROVED' |
          'INVENTORY_LOW_STOCK';
    title: string;
    message: string;
    payload?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationRecipient {
    id: string; // Recipient UUID
    notificationId: string;
    userId: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
    notification: NotificationPayload;
}

export interface NotificationPreference {
    id: string;
    userId: string;
    notificationType: 'ALERT' | 'SECURITY' | 'RESERVATION' | 'PROMO' | 'ORDER' |
                      'SHIFT_PUBLISHED' | 'SHIFT_CREATED' | 'SHIFT_UPDATED' | 'SHIFT_SWAP_REQUEST' | 'SHIFT_SWAP_APPROVED' | 'TIME_OFF_REQUEST' | 'TIME_OFF_APPROVED' |
                      'INVENTORY_LOW_STOCK';
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}
