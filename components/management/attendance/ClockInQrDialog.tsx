import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Loader2, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateAttendanceQrApiCall, ATTENDANCE_QR_ROTATION_SECONDS, ClockQrPayload } from "@/features/shifts/service";

interface ClockInQrDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  businessId: string;
}

export default function ClockInQrDialog({ open, onOpenChange, businessId }: ClockInQrDialogProps) {
  const { t } = useTranslation("management");
  const [payload, setPayload] = useState<ClockQrPayload | null>(null);
  const [secsLeft, setSecsLeft] = useState(ATTENDANCE_QR_ROTATION_SECONDS);
  const rotationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = useCallback(async () => {
    try {
      const res = await generateAttendanceQrApiCall(businessId);
      setPayload(res.data.data);
      setSecsLeft(ATTENDANCE_QR_ROTATION_SECONDS);
    } catch {
      toast.error(t("attendance_live.qr_generate_error"));
    }
  }, [businessId, t]);

  // Silently mint a fresh token every ATTENDANCE_QR_ROTATION_SECONDS while the dialog is
  // open — this is the core anti-photo-sharing defense, so it must not depend on the user
  // taking any action (unlike the one-shot station pairing code).
  useEffect(() => {
    if (!open) {
      setPayload(null);
      if (rotationRef.current) clearInterval(rotationRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    generate();
    rotationRef.current = setInterval(generate, ATTENDANCE_QR_ROTATION_SECONDS * 1000);
    tickRef.current = setInterval(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000);

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, businessId]);

  // Serialize the API response as-is — the envelope shape (type/businessId/token) is
  // owned by the backend, not reconstructed here.
  const qrValue = payload ? JSON.stringify(payload) : null;
  const progress = (secsLeft / ATTENDANCE_QR_ROTATION_SECONDS) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            {t("attendance_live.qr_dialog_title")}
          </DialogTitle>
          <DialogDescription>
            {t("attendance_live.qr_dialog_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex justify-center p-4 bg-white rounded-2xl border">
            {qrValue ? (
              <QRCode size={200} value={qrValue} viewBox="0 0 200 200" />
            ) : (
              <div className="flex items-center justify-center h-[200px] w-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {payload && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs text-center font-bold text-muted-foreground">
                {t("attendance_live.qr_refreshing_in", { secs: secsLeft })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
