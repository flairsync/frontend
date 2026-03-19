import React from 'react';
import { useNotifications } from '@/features/notifications/useNotifications';
import { NotificationPayload, NotificationRecipient } from '@/features/notifications/types';
import { navigate } from 'vike/client/router';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ShieldAlert, Calendar, Tag, ShoppingBag, CheckCircle } from 'lucide-react';

const getIconForType = (type: NotificationPayload['type']) => {
    switch (type) {
        case 'SHIFT_PUBLISHED':
        case 'SHIFT_CREATED':
        case 'SHIFT_UPDATED':
            return <Calendar className="w-5 h-5 text-indigo-500" />;
        case 'SECURITY': return <ShieldAlert className="w-5 h-5 text-red-500" />;
        case 'RESERVATION': return <Calendar className="w-5 h-5 text-blue-500" />;
        case 'PROMO': return <Tag className="w-5 h-5 text-green-500" />;
        case 'ORDER': return <ShoppingBag className="w-5 h-5 text-amber-500" />;
        case 'ALERT':
        default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

export const NotificationList = ({ filterType = 'all' }: { filterType?: string }) => {
    const {
        notifications,
        loadingNotifications,
        markAsRead,
        markAllAsRead,
        markingAsRead,
        markingAllAsRead
    } = useNotifications(50, 0);

    if (loadingNotifications) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading notifications...</div>;
    }

    const filteredNotifications = filterType === 'all'
        ? notifications
        : notifications.filter(n => n.notification.type === filterType);

    if (!filteredNotifications || filteredNotifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-background rounded-lg border shadow-sm">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>No notifications to display.</p>
            </div>
        );
    }

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    const handleNotificationClick = (record: NotificationRecipient) => {
        const { notification, id, isRead } = record;
        
        // Mark as read if not already
        if (!isRead) {
            markAsRead(id);
        }

        // Handle Redirection based on type and payload
        switch (notification.type) {
            case 'SHIFT_PUBLISHED':
            case 'SHIFT_CREATED':
            case 'SHIFT_UPDATED':
                const bizId = notification.payload?.businessId;
                if (bizId) {
                    navigate(`/manage/${bizId}/staff/shifts?tab=schedule`);
                } else {
                    navigate('/shifts');
                }
                break;
            case 'SHIFT_SWAP_REQUEST':
            case 'TIME_OFF_APPROVED':
                const bizIdReq = notification.payload?.businessId;
                if (bizIdReq) {
                    navigate(`/manage/${bizIdReq}/staff/shifts?tab=requests`);
                } else {
                    navigate('/shifts');
                }
                break;
            default:
                // For other types, we might not have a specific redirection yet
                break;
        }
    };

    return (
        <div className="flex flex-col w-full bg-background rounded-lg border shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Your Notifications</h3>
                <button
                    onClick={handleMarkAllRead}
                    disabled={markingAllAsRead}
                    className="text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                    <CheckCircle className="w-4 h-4" />
                    Mark all as read
                </button>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredNotifications.map((record) => {
                    const { notification, isRead, id } = record;
                    return (
                        <div
                            key={id}
                            onClick={() => handleNotificationClick(record)}
                            className={`p-4 flex gap-4 transition-colors hover:bg-muted/50 cursor-pointer ${!isRead ? 'bg-muted/20' : ''}`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getIconForType(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className={`text-sm font-medium ${!isRead ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className={`mt-1 text-sm ${!isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.message}
                                </p>
                            </div>
                            {!isRead && (
                                <button
                                    onClick={() => markAsRead(id)}
                                    disabled={markingAsRead}
                                    className="flex-shrink-0 self-center w-3 h-3 bg-blue-500 rounded-full"
                                    title="Mark as read"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
