import React from "react";
import { useTranslation } from "react-i18next";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/useSession";
import { UserSession } from "@/models/UserSession"; // your class
import { usePageContext } from "vike-react/usePageContext";

const SessionManagementSettings = () => {
    const { t } = useTranslation('profile');
    const { userSessions, disconnectUserSession } = useSession(); // Array<UserSession>
    const {
        session
    } = usePageContext();
    const handleDisconnect = (sessionId: string) => {
        console.log("Disconnect session:", sessionId);

        disconnectUserSession({
            sessionId: sessionId
        })
    };

    // If userSessions is empty, fallback to template static data
    const sessionsToRender =
        userSessions && userSessions.length > 0
            ? [...userSessions]
            : [
                {
                    id: "1",
                    deviceName: "Windows 11 - Chrome",
                    location: "Andorra la Vella, Andorra",
                    expiresAt: new Date("2025-10-26T20:00:00"),
                    active: true,
                    trustedDevice: false,
                },
                {
                    id: "2",
                    deviceName: "iPhone 14 - Safari",
                    location: "Barcelona, Spain",
                    expiresAt: new Date("2025-10-25T18:30:00"),
                    active: false,
                    trustedDevice: false,
                },
                {
                    id: "3",
                    deviceName: "MacBook Pro - Firefox",
                    location: "Madrid, Spain",
                    expiresAt: new Date("2025-10-24T09:15:00"),
                    active: false,
                    trustedDevice: false,
                },
                {
                    id: "4",
                    deviceName: "Android - Chrome",
                    location: "Paris, France",
                    expiresAt: new Date("2025-10-23T22:45:00"),
                    active: false,
                    trustedDevice: false,
                },
            ];

    // Sort sessions: current ones first
    const sortedSessions = sessionsToRender.sort(
        (a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)
    );

    const isCurrentSession = (sid: string) => {
        if (session) {
            return session.id == sid;
        }
        return false;
    }

    return (
        <AccordionItem value="user-sessions" className="border rounded-lg px-3">
            <AccordionTrigger>{t('session_management_settings.title')}</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                {sortedSessions.length === 0 ? (
                    <p className="text-muted-foreground">{t('session_management_settings.no_active_sessions')}</p>
                ) : (
                    <div className="space-y-2">
                        {sortedSessions.map((sess: any) => (
                            <div
                                key={sess.id}
                                className={`flex justify-between items-center p-3 border rounded-lg ${isCurrentSession(sess.id) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card border-border"
                                    }`}
                            >
                                <div>
                                    <p className="font-medium">{sess.deviceName || t('session_management_settings.unknown_device')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {sess.location || t('session_management_settings.unknown_location')} — {t('session_management_settings.last_active')}:{" "}
                                        {sess.expiresAt
                                            ? new Date(sess.expiresAt).toLocaleString()
                                            : t('session_management_settings.unknown')}
                                    </p>
                                    {isCurrentSession(sess.id) && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t('session_management_settings.current_session')}</p>
                                    )}
                                    {sess.trustedDevice && (
                                        <p className="text-xs text-primary font-semibold">{t('session_management_settings.trusted_device')}</p>
                                    )}
                                </div>
                                {!isCurrentSession(sess.id) && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDisconnect(sess.id)}
                                    >
                                        {t('session_management_settings.disconnect')}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};

export default SessionManagementSettings;
