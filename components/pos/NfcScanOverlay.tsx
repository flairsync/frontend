import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Nfc, X, LogIn, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNfcScan } from "@/features/pos/useNfcScan";
import { formatTime } from "@/lib/dateUtils";

// Keyboard-wedge NFC readers "type" the tag id like a keyboard, terminated by Enter
// (or not, on cheaper hardware). These constants disambiguate a reader burst from a
// human typing in whatever's behind this overlay while it's open:
const FAST_KEY_GAP_MS = 50; // reader chars land faster than this; a human doesn't
const IDLE_FINALIZE_MS = 80; // fallback finalize for readers with no Enter terminator
const DEDUPE_MS = 2000; // ignore an identical tag id resubmitted this fast (cheap readers can repeat mid-tap)
const MIN_TAG_LENGTH = 8; // tag ids are UUIDs; shorter buffers are almost certainly stray keystrokes
const MAX_RECENT = 5;

interface RecentTap {
    id: string;
    at: Date;
    status: "check_in" | "check_out" | "error";
    message: string;
}

export default function NfcScanOverlay() {
    const { t } = useTranslation("station");
    const [open, setOpen] = useState(false);
    const [recentTaps, setRecentTaps] = useState<RecentTap[]>([]);
    const { mutate: scan, isPending } = useNfcScan();

    const bufferRef = useRef("");
    const lastKeyTimeRef = useRef(0);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSubmittedRef = useRef<{ tagId: string; at: number } | null>(null);

    const pushRecent = useCallback((entry: Omit<RecentTap, "id" | "at">) => {
        setRecentTaps((prev) => [
            { ...entry, id: crypto.randomUUID(), at: new Date() },
            ...prev,
        ].slice(0, MAX_RECENT));
    }, []);

    const submitTag = useCallback((tagId: string) => {
        scan(tagId, {
            onSuccess: (result) => {
                const label = result.action === "check_in"
                    ? t("nfc_scan.toasts.clocked_in")
                    : t("nfc_scan.toasts.clocked_out");
                toast.success(label);
                pushRecent({ status: result.action, message: label });
            },
            onError: (err: any) => {
                const message = err?.response?.data?.message ?? t("nfc_scan.errors.generic");
                toast.error(message);
                pushRecent({ status: "error", message });
            },
        });
    }, [scan, pushRecent, t]);

    const finalizeBuffer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        const tagId = bufferRef.current.trim();
        bufferRef.current = "";
        if (tagId.length < MIN_TAG_LENGTH) return;

        const now = Date.now();
        const last = lastSubmittedRef.current;
        if (last && last.tagId === tagId && now - last.at < DEDUPE_MS) return;
        lastSubmittedRef.current = { tagId, at: now };

        submitTag(tagId);
    }, [submitTag]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === "Enter") {
                finalizeBuffer();
                return;
            }

            if (e.key.length !== 1) return; // ignore Shift, Tab, arrows, etc.

            const now = Date.now();
            const gap = now - lastKeyTimeRef.current;
            bufferRef.current = bufferRef.current && gap <= FAST_KEY_GAP_MS
                ? bufferRef.current + e.key
                : e.key;
            lastKeyTimeRef.current = now;

            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(finalizeBuffer, IDLE_FINALIZE_MS);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            bufferRef.current = "";
        };
    }, [open, finalizeBuffer]);

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="flex flex-col items-center gap-2 px-2 py-4 rounded-l-xl bg-primary text-primary-foreground shadow-lg border border-primary/30 border-r-0 hover:brightness-110 transition-all"
                >
                    <Nfc className="w-5 h-5" />
                    <span
                        className="text-[9px] font-black uppercase tracking-widest"
                        style={{ writingMode: "vertical-rl" }}
                    >
                        {t("nfc_scan.trigger")}
                    </span>
                </button>
            )}

            {open && (
                <div className="w-72 bg-card border border-border rounded-l-2xl shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Nfc className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold">{t("nfc_scan.panel_title")}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="px-4 py-3 flex flex-col gap-2 border-b border-border">
                        <p className="text-xs text-muted-foreground">{t("nfc_scan.panel_description")}</p>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border">
                            <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isPending ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                                }`}
                            />
                            <span className="text-xs font-bold text-foreground">
                                {isPending ? t("nfc_scan.status.processing") : t("nfc_scan.status.ready")}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {t("nfc_scan.recent_scans")}
                        </p>
                        {recentTaps.length === 0 && (
                            <p className="text-xs text-muted-foreground/70 py-2">{t("nfc_scan.empty_state")}</p>
                        )}
                        {recentTaps.map((tap) => (
                            <div key={tap.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg bg-muted/30">
                                {tap.status === "check_in" && <LogIn className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                                {tap.status === "check_out" && <LogOut className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                                {tap.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                                <span className="flex-1 truncate">{tap.message}</span>
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTime(tap.at)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
