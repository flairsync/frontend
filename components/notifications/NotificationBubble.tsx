import React from 'react';

import { useNotifications } from '@/features/notifications/useNotifications';
import { useNotificationSocket } from '@/features/notifications/useNotificationSocket';
import { navigate } from 'vike/client/router';
import { NotificationPayload } from '@/features/notifications/types';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ShieldAlert, Calendar, Tag, ShoppingBag, CheckCircle, ChevronRight } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const getIconForType = (type: NotificationPayload['type']) => {
    switch (type) {
        case 'SECURITY': return <ShieldAlert className="w-5 h-5 text-red-500" />;
        case 'RESERVATION': return <Calendar className="w-5 h-5 text-blue-500" />;
        case 'PROMO': return <Tag className="w-5 h-5 text-green-500" />;
        case 'ORDER': return <ShoppingBag className="w-5 h-5 text-amber-500" />;
        case 'ALERT':
        default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

export const NotificationBubble = () => {
    // Initialize socket connection mapping to the user
    useNotificationSocket();

    const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications(5, 0); // Fetch top 5 for the bubbles

    const handleNavigateToHub = () => {
        navigate('/notifications');
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors flex items-center justify-center"
                >
                    <Bell className="w-5 h-5" />

                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-background transform translate-x-1/4 -translate-y-1/4">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            className="text-xs text-primary hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto flex flex-col divide-y">
                    {(!notifications || notifications.length === 0) ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((record) => {
                            const { notification, isRead, id } = record;
                            return (
                                <div
                                    key={id}
                                    className={`p-3 flex gap-3 transition-colors hover:bg-muted/50 ${!isRead ? 'bg-muted/10' : ''}`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="scale-75 origin-top-left">
                                            {getIconForType(notification.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!isRead ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground block mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {!isRead && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(id);
                                            }}
                                            className="flex-shrink-0 self-center w-2 h-2 bg-blue-500 rounded-full"
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-2 border-t text-center">
                    <button
                        onClick={handleNavigateToHub}
                        className="text-xs text-primary hover:underline flex items-center justify-center w-full gap-1 py-1"
                    >
                        Go to notifications hub <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
