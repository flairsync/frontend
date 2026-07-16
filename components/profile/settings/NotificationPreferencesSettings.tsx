import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Loader2, Mail, Smartphone, Bell } from 'lucide-react'
import { useNotificationPreferences } from '@/features/notifications/useNotifications'
import { NotificationPreference } from '@/features/notifications/types'

type NotificationTypeKey = NotificationPreference['notificationType']
type Channel = 'emailEnabled' | 'inAppEnabled' | 'pushEnabled'

const CHANNELS: { key: Channel; label: string; icon: typeof Mail }[] = [
    { key: 'emailEnabled', label: 'Email', icon: Mail },
    { key: 'inAppEnabled', label: 'In-App', icon: Bell },
    { key: 'pushEnabled', label: 'Push', icon: Smartphone },
]

const GROUPS: { title: string; types: { key: NotificationTypeKey; label: string }[] }[] = [
    {
        title: 'Orders & Reservations',
        types: [
            { key: 'ORDER', label: 'New orders' },
            { key: 'RESERVATION', label: 'Reservations' },
        ],
    },
    {
        title: 'Scheduling & Shifts',
        types: [
            { key: 'SHIFT_PUBLISHED', label: 'Schedule published' },
            { key: 'SHIFT_CREATED', label: 'New shift assigned' },
            { key: 'SHIFT_UPDATED', label: 'Shift updated' },
            { key: 'SHIFT_SWAP_REQUEST', label: 'Shift swap requested' },
            { key: 'SHIFT_SWAP_APPROVED', label: 'Shift swap approved' },
            { key: 'SHIFT_NO_SHOW', label: 'Staff no-show' },
            { key: 'TIME_OFF_REQUEST', label: 'Time-off requested' },
            { key: 'TIME_OFF_APPROVED', label: 'Time-off approved' },
        ],
    },
    {
        title: 'Attendance',
        types: [
            { key: 'ATTENDANCE_OVERDUE', label: 'Attendance overdue' },
            { key: 'ATTENDANCE_AUTO_CLOSED', label: 'Attendance auto-closed' },
        ],
    },
    {
        title: 'Inventory & Tasks',
        types: [
            { key: 'INVENTORY_LOW_STOCK', label: 'Low stock alerts' },
            { key: 'TASK_ASSIGNED', label: 'Task assigned' },
            { key: 'TASK_STATUS_CHANGED', label: 'Task status changed' },
        ],
    },
    {
        title: 'Team & Organization',
        types: [
            { key: 'ANNOUNCEMENT', label: 'Announcements' },
            { key: 'MESSAGE', label: 'Messages' },
            { key: 'ORGANIZATION_JOIN_REQUEST', label: 'Organization join requests' },
            { key: 'ORGANIZATION_JOIN_RESOLVED', label: 'Organization join resolved' },
        ],
    },
    {
        title: 'General',
        types: [
            { key: 'ALERT', label: 'General alerts' },
            { key: 'SECURITY', label: 'Security alerts' },
            { key: 'PROMO', label: 'Promotions' },
        ],
    },
]

const NotificationPreferencesSettings = () => {
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
            <AccordionTrigger>Notifications</AccordionTrigger>
            <AccordionContent className="space-y-6 py-2">
                <p className="text-xs text-muted-foreground">
                    Choose how you want to be notified for each type of event.
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
