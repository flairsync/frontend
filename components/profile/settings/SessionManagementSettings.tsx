import React from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/useSession";
import { UserSession } from "@/models/UserSession"; // your class
import { usePageContext } from "vike-react/usePageContext";

const SessionManagementSettings = () => {
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
            <AccordionTrigger>User Sessions</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                {sortedSessions.length === 0 ? (
                    <p className="text-muted-foreground">No active sessions.</p>
                ) : (
                    <div className="space-y-2">
                        {sortedSessions.map((sess: any) => (
                            <div
                                key={sess.id}
                                className={`flex justify-between items-center p-3 border rounded-lg ${isCurrentSession(sess.id) ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                                    }`}
                            >
                                <div>
                                    <p className="font-medium">{sess.deviceName || "Unknown Device"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {sess.location || "Unknown Location"} — Last active:{" "}
                                        {sess.expiresAt
                                            ? new Date(sess.expiresAt).toLocaleString()
                                            : "Unknown"}
                                    </p>
                                    {isCurrentSession(sess.id) && (
                                        <p className="text-xs text-green-600 font-semibold">Current Session</p>
                                    )}
                                    {sess.trustedDevice && (
                                        <p className="text-xs text-blue-600 font-semibold">Trusted Device</p>
                                    )}
                                </div>
                                {!isCurrentSession(sess.id) && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDisconnect(sess.id)}
                                    >
                                        Disconnect
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
