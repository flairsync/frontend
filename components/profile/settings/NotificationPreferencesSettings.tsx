import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Loader2, Mail, Smartphone, Bell } from 'lucide-react'
import { useNotificationPreferences } from '@/features/notifications/useNotifications'
import { NotificationPreference } from '@/features/notifications/types'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

type NotificationTypeKey = NotificationPreference['notificationType']
type Channel = 'emailEnabled' | 'inAppEnabled' | 'pushEnabled'

const getChannels = (t: TFunction): { key: Channel; label: string; icon: typeof Mail }[] => [
    { key: 'emailEnabled', label: t('notification_preferences_settings.channels.email'), icon: Mail },
    { key: 'inAppEnabled', label: t('notification_preferences_settings.channels.in_app'), icon: Bell },
    { key: 'pushEnabled', label: t('notification_preferences_settings.channels.push'), icon: Smartphone },
]

const getGroups = (t: TFunction): { title: string; types: { key: NotificationTypeKey; label: string }[] }[] => [
    {
        title: t('notification_preferences_settings.groups.orders_reservations.title'),
        types: [
            { key: 'ORDER', label: t('notification_preferences_settings.groups.orders_reservations.order') },
            { key: 'RESERVATION', label: t('notification_preferences_settings.groups.orders_reservations.reservation') },
        ],
    },
    {
        title: t('notification_preferences_settings.groups.scheduling_shifts.title'),
        types: [
            { key: 'SHIFT_PUBLISHED', label: t('notification_preferences_settings.groups.scheduling_shifts.shift_published') },
            { key: 'SHIFT_CREATED', label: t('notification_preferences_settings.groups.scheduling_shifts.shift_created') },
            { key: 'SHIFT_UPDATED', label: t('notification_preferences_settings.groups.scheduling_shifts.shift_updated') },
            { key: 'SHIFT_SWAP_REQUEST', label: t('notification_preferences_settings.groups.scheduling_shifts.shift_swap_request') },
            { key: 'SHIFT_SWAP_APPROVED', label: t('notification_preferences_settings.groups.scheduling_shifts.shift_swap_approved') },
            { key: 'SHIFT_NO_SHOW', label: t('notification_preferences_settings.groups.scheduling_shifts.shift_no_show') },
            { key: 'TIME_OFF_REQUEST', label: t('notification_preferences_settings.groups.scheduling_shifts.time_off_request') },
            { key: 'TIME_OFF_APPROVED', label: t('notification_preferences_settings.groups.scheduling_shifts.time_off_approved') },
        ],
    },
    {
        title: t('notification_preferences_settings.groups.attendance.title'),
        types: [
            { key: 'ATTENDANCE_OVERDUE', label: t('notification_preferences_settings.groups.attendance.overdue') },
            { key: 'ATTENDANCE_AUTO_CLOSED', label: t('notification_preferences_settings.groups.attendance.auto_closed') },
        ],
    },
    {
        title: t('notification_preferences_settings.groups.inventory_tasks.title'),
        types: [
            { key: 'INVENTORY_LOW_STOCK', label: t('notification_preferences_settings.groups.inventory_tasks.low_stock') },
            { key: 'TASK_ASSIGNED', label: t('notification_preferences_settings.groups.inventory_tasks.task_assigned') },
            { key: 'TASK_STATUS_CHANGED', label: t('notification_preferences_settings.groups.inventory_tasks.task_status_changed') },
        ],
    },
    {
        title: t('notification_preferences_settings.groups.team_organization.title'),
        types: [
            { key: 'ANNOUNCEMENT', label: t('notification_preferences_settings.groups.team_organization.announcement') },
            { key: 'MESSAGE', label: t('notification_preferences_settings.groups.team_organization.message') },
            { key: 'ORGANIZATION_JOIN_REQUEST', label: t('notification_preferences_settings.groups.team_organization.join_request') },
            { key: 'ORGANIZATION_JOIN_RESOLVED', label: t('notification_preferences_settings.groups.team_organization.join_resolved') },
        ],
    },
    {
        title: t('notification_preferences_settings.groups.general.title'),
        types: [
            { key: 'ALERT', label: t('notification_preferences_settings.groups.general.alert') },
            { key: 'SECURITY', label: t('notification_preferences_settings.groups.general.security') },
            { key: 'PROMO', label: t('notification_preferences_settings.groups.general.promo') },
        ],
    },
]

const NotificationPreferencesSettings = () => {
    const { t } = useTranslation('profile')
    const CHANNELS = getChannels(t)
    const GROUPS = getGroups(t)
    const {
        preferences,
        loadingPreferences,
        updatePreferences,
        updatingPreferences,
    } = useNotificationPreferences()

    const prefsByType = new Map(preferences.map((p) => [p.notificationType, p]))

    // Backend defaults every channel to enabled until the user explicitly
    // overrides it (no preference row exists until then).
    const isEnabled = (type: NotificationTypeKey, channel: Channel) =>
        prefsByType.get(type)?.[channel] ?? true

    const handleToggle = (type: NotificationTypeKey, channel: Channel, checked: boolean) => {
        updatePreferences({ type, updates: { [channel]: checked } })
    }

    return (
        <AccordionItem value="notifications" className="border rounded-lg px-3">
            <AccordionTrigger>{t('notification_preferences_settings.title')}</AccordionTrigger>
            <AccordionContent className="space-y-6 py-2">
                <p className="text-xs text-muted-foreground">
                    {t('notification_preferences_settings.description')}
                </p>

                {loadingPreferences ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {GROUPS.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <div className="grid grid-cols-[1fr_repeat(3,3.5rem)] items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {group.title}
                                    </span>
                                    {CHANNELS.map((channel) => (
                                        <span
                                            key={channel.key}
                                            className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground"
                                        >
                                            <channel.icon className="h-3.5 w-3.5" />
                                            {channel.label}
                                        </span>
                                    ))}
                                </div>

                                {group.types.map((type) => (
                                    <div
                                        key={type.key}
                                        className="grid grid-cols-[1fr_repeat(3,3.5rem)] items-center gap-2 py-1"
                                    >
                                        <span className="text-sm">{type.label}</span>
                                        {CHANNELS.map((channel) => (
                                            <div key={channel.key} className="flex justify-center">
                                                <Switch
                                                    checked={isEnabled(type.key, channel.key)}
                                                    disabled={updatingPreferences}
                                                    onCheckedChange={(checked) =>
                                                        handleToggle(type.key, channel.key, checked)
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    )
}

export default NotificationPreferencesSettings
