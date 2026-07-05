import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import {
    getNotificationsApiCall,
    getUnreadCountApiCall,
    markAsReadApiCall,
    markAllAsReadApiCall,
    getPreferencesApiCall,
    updatePreferencesApiCall
} from "./service";
import { NotificationRecipient } from "./types";
import { PaginatedData } from "../shared/api-response";

export const useNotifications = (limit: number = 20, offset: number = 0) => {
    const queryClient = useQueryClient();
    const { user } = usePageContext();

    const {
        data: notificationsData,
        isLoading: loadingNotifications,
        error: notificationsError,
        refetch: refetchNotifications
    } = useQuery<PaginatedData<NotificationRecipient>>({
        queryKey: ['notifications', limit, offset],
        queryFn: () => getNotificationsApiCall(limit, offset),
        enabled: user != null,
    });

    const {
        data: unreadCountData,
        isLoading: loadingUnreadCount,
        error: unreadCountError,
        refetch: refetchUnreadCount
    } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCountApiCall,
        enabled: user != null,
    });

    const {
        mutate: markAsRead,
        isPending: markingAsRead
    } = useMutation({
        mutationFn: markAsReadApiCall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const {
        mutate: markAllAsRead,
        isPending: markingAllAsRead
    } = useMutation({
        mutationFn: markAllAsReadApiCall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        notifications: notificationsData?.data || [],
        totalPages: notificationsData?.pages ?? 1,
        currentPage: notificationsData?.current ?? 1,
        loadingNotifications,
        notificationsError,
        refetchNotifications,

        unreadCount: unreadCountData?.data?.count || 0,
        loadingUnreadCount,
        unreadCountError,
        refetchUnreadCount,

        markAsRead,
        markingAsRead,

        markAllAsRead,
        markingAllAsRead
    };
};

export const useNotificationPreferences = () => {
    const queryClient = useQueryClient();
    const { user } = usePageContext();

    const {
        data: preferencesData,
        isLoading: loadingPreferences,
        error: preferencesError,
    } = useQuery({
        queryKey: ['notification-preferences'],
        queryFn: getPreferencesApiCall,
        enabled: user != null,
    });

    const {
        mutate: updatePreferences,
        isPending: updatingPreferences
    } = useMutation({
        mutationFn: updatePreferencesApiCall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
        }
    });

    return {
        preferences: preferencesData?.data || [],
        loadingPreferences,
        preferencesError,
        updatePreferences,
        updatingPreferences
    };
}
