import { useState, useEffect, useCallback } from "react";
import { staffApi } from "@/features/station/station-api";
import { useStaffSession } from "@/features/pos/useStaffSession";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LogIn, LogOut, Coffee, Play, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatTime } from "@/lib/dateUtils";

type ClockState = "not_clocked_in" | "clocked_in" | "on_break";

interface AttendanceRecord {
    id: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: "PRESENT" | "LATE" | "ON_BREAK" | "NO_SHOW";
    lifecycleStatus: "ONGOING" | "FINISHED" | "VALIDATED";
    breaks: { start: string; end: string | null; type: "PAID" | "UNPAID" }[];
}

function deriveClockState(attendance: AttendanceRecord | null): ClockState {
    if (!attendance || attendance.lifecycleStatus === "FINISHED") return "not_clocked_in";
    if (attendance.status === "ON_BREAK") return "on_break";
    if (attendance.checkInTime && !attendance.checkOutTime) return "clocked_in";
    return "not_clocked_in";
}

function elapsed(from: string) {
    const ms = Date.now() - new Date(from).getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AttendancePanel() {
    const { t } = useTranslation("pos");
    const { session } = useStaffSession();
    const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await staffApi.get("/station/staff/attendance/status");
            setAttendance(res.data?.data?.attendance ?? null);
        } catch {
            setAttendance(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) fetchStatus();
        else setLoading(false);
    }, [session, fetchStatus]);

    async function act(endpoint: string, label: string, failureLabel: string, body?: object) {
        setActing(true);
        try {
            await staffApi.post(`/station/staff/attendance/${endpoint}`, body ?? {});
            await fetchStatus();
            toast.success(label);
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? failureLabel);
        } finally {
            setActing(false);
        }
    }

    if (!session) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                <AlertCircle className="w-4 h-4" />
                {t("attendance_panel.no_staff_logged_in")}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    const clockState = deriveClockState(attendance);
    const activeBreak = attendance?.breaks.find((b) => !b.end);

    return (
        <div className="space-y-3">
            {/* Status badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border">
                <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        clockState === "clocked_in"
                            ? "bg-emerald-500"
                            : clockState === "on_break"
                            ? "bg-amber-500"
                            : "bg-muted-foreground/40"
                    }`}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">
                        {clockState === "clocked_in"
                            ? t("attendance_panel.status.clocked_in")
                            : clockState === "on_break"
                            ? t("attendance_panel.status.on_break")
                            : t("attendance_panel.status.not_clocked_in")}
                    </p>
                    {attendance?.checkInTime && clockState !== "not_clocked_in" && (
                        <p className="text-[10px] text-muted-foreground">
                            {t("attendance_panel.since", { time: formatTime(attendance.checkInTime), elapsed: elapsed(attendance.checkInTime) })}
                        </p>
                    )}
                    {activeBreak && (
                        <p className="text-[10px] text-amber-600 font-bold">
                            {t("attendance_panel.break_started", { time: formatTime(activeBreak.start), elapsed: elapsed(activeBreak.start) })}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            {clockState === "not_clocked_in" && (
                <Button
                    className="w-full gap-2 font-black text-xs h-10"
                    disabled={acting}
                    onClick={() => act("clock-in", t("attendance_panel.toasts.clocked_in"), t("attendance_panel.toasts.clock_in_failed"))}
                >
                    <LogIn className="w-4 h-4" />
                    {t("attendance_panel.actions.clock_in")}
                </Button>
            )}

            {clockState === "clocked_in" && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2 font-black text-xs h-10"
                        disabled={acting}
                        onClick={() => act("break/start", t("attendance_panel.toasts.break_started"), t("attendance_panel.toasts.break_start_failed"), { type: "UNPAID" })}
                    >
                        <Coffee className="w-4 h-4" />
                        {t("attendance_panel.actions.break")}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 gap-2 font-black text-xs h-10 text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={acting}
                        onClick={() => act("clock-out", t("attendance_panel.toasts.clocked_out"), t("attendance_panel.toasts.clock_out_failed"))}
                    >
                        <LogOut className="w-4 h-4" />
                        {t("attendance_panel.actions.clock_out")}
                    </Button>
                </div>
            )}

            {clockState === "on_break" && (
                <Button
                    className="w-full gap-2 font-black text-xs h-10 bg-amber-500 hover:bg-amber-600 text-amber-950"
                    disabled={acting}
                    onClick={() => act("break/end", t("attendance_panel.toasts.break_ended"), t("attendance_panel.toasts.break_end_failed"))}
                >
                    <Play className="w-4 h-4" />
                    {t("attendance_panel.actions.end_break")}
                </Button>
            )}

            {/* Today's breaks summary */}
            {attendance?.breaks && attendance.breaks.length > 0 && (
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {t("attendance_panel.todays_breaks")}
                    </p>
                    {attendance.breaks.map((b, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] text-muted-foreground px-2">
                            <span className="flex items-center gap-1.5">
                                {b.end ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                    <Clock className="w-3 h-3 text-amber-500" />
                                )}
                                {formatTime(b.start)} — {b.end ? formatTime(b.end) : t("attendance_panel.ongoing")}
                            </span>
                            <span className="uppercase font-bold">
                                {b.type === "PAID" ? t("attendance_panel.break_type.paid") : t("attendance_panel.break_type.unpaid")}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
