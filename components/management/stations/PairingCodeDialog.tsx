import { useState, useEffect, useCallback } from "react";
import { stationService } from "@/features/station/service";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Monitor, ChefHat, RefreshCw, Copy, Check, Loader2, Terminal,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

// ─── Pairing Code Dialog ──────────────────────────────────────────────────────

function useCountdown(expiresAt: Date | null) {
  const [secs, setSecs] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) : 0
  );
  useEffect(() => {
    if (!expiresAt) return;
    setSecs(Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)));
    const t = setInterval(() => setSecs((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return secs;
}

interface PairingCodeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  businessId: string;
}

export function PairingCodeDialog({ open, onOpenChange, businessId }: PairingCodeDialogProps) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [stationType, setStationType] = useState<"pos" | "kds">("pos");
  const secsLeft = useCountdown(expiresAt);
  const expired = secsLeft === 0 && code !== null;

  const generate = useCallback(async () => {
    try {
      const res = await stationService.generatePairingCode(businessId);
      setCode(res.data.data.code);
      setExpiresAt(new Date(res.data.data.expiresAt));
      setCopied(false);
    } catch {
      toast.error("Failed to generate code. Please try again.");
    }
  }, [businessId]);

  useEffect(() => {
    if (open) {
      generate();
      setStationType("pos");
    }
  }, [open]);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const linkUrl =
    code && typeof window !== "undefined"
      ? `${window.location.origin}/station/${stationType}?linkCode=${encodeURIComponent(code)}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            Pair a New Station
          </DialogTitle>
          <DialogDescription>
            Scan the QR code on the device, or enter the code manually, within 5 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Station Type
            </Label>
            <Select value={stationType} onValueChange={(v: "pos" | "kds") => setStationType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pos">
                  <span className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5" /> POS Terminal
                  </span>
                </SelectItem>
                <SelectItem value="kds">
                  <span className="flex items-center gap-2">
                    <ChefHat className="w-3.5 h-3.5" /> Kitchen Display (KDS)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center p-4 bg-white rounded-2xl border">
            {linkUrl ? (
              <QRCode size={180} value={linkUrl} viewBox="0 0 180 180" />
            ) : (
              <div className="flex items-center justify-center h-[180px] w-[180px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="relative bg-muted rounded-2xl p-6 text-center border">
            {code ? (
              <>
                <p className="text-5xl font-mono font-black tracking-[0.25em] text-foreground">
                  {code}
                </p>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </>
            ) : (
              <div className="flex justify-center py-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {code && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    expired ? "bg-destructive" : secsLeft < 60 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, (secsLeft / 300) * 100)}%` }}
                />
              </div>
              <p className={`text-xs text-center font-bold ${expired ? "text-destructive" : "text-muted-foreground"}`}>
                {expired ? "Code expired" : `Expires in ${secsLeft}s`}
              </p>
            </div>
          )}

          {expired && (
            <Button onClick={generate} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Generate New Code
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
