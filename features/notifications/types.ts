export interface NotificationPayload {
    id: string; // UUID
    type: 'ALERT' | 'SECURITY' | 'RESERVATION' | 'PROMO' | 'ORDER';
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
    notificationType: 'ALERT' | 'SECURITY' | 'RESERVATION' | 'PROMO' | 'ORDER';
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}
