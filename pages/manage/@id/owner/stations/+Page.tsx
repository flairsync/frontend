import { useState, useEffect, useCallback } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stationService, type StationRecord } from "@/features/station/service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Monitor, ChefHat, Plus, Unplug, RefreshCw,
  Wifi, WifiOff, Clock, Copy, Check, Loader2, Terminal,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000; // 2 min
}

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

// ─── Pairing Code Dialog ──────────────────────────────────────────────────────

function PairingCodeDialog({
  open,
  onOpenChange,
  businessId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  businessId: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
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

  // Auto-generate when dialog opens
  useEffect(() => {
    if (open) generate();
  }, [open]);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const progress = expiresAt
    ? (secsLeft / Math.floor((expiresAt.getTime() - (expiresAt.getTime() - 300_000)) / 1000)) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            Pair a New Station
          </DialogTitle>
          <DialogDescription>
            Enter this code on the station device within 5 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Code display */}
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

          {/* Countdown bar */}
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

// ─── Station Card ─────────────────────────────────────────────────────────────

function StationCard({
  station,
  businessId,
  onRevoke,
}: {
  station: StationRecord;
  businessId: string;
  onRevoke: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(station.name);
  const qc = useQueryClient();

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => stationService.updateStation(businessId, station.id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      setEditing(false);
      toast.success("Station renamed.");
    },
    onError: () => toast.error("Failed to rename station."),
  });

  const online = isOnline(station.lastSeenAt);
  const TypeIcon = station.type === "kds" ? ChefHat : Monitor;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              station.type === "kds"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                : "bg-primary/10 border-primary/20 text-primary"
            }`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-7 text-sm font-bold w-40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") save();
                      if (e.key === "Escape") { setEditing(false); setName(station.name); }
                    }}
                  />
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => save()} disabled={isPending}>
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-bold hover:text-primary transition-colors text-left"
                >
                  {station.name}
                </button>
              )}
              <Badge
                variant="secondary"
                className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${
                  station.type === "kds"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {station.type === "kds" ? "Kitchen Display" : "POS Terminal"}
              </Badge>
            </div>
          </div>

          {/* Online indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
            online ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
          }`}>
            {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {online ? "Online" : "Offline"}
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Clock className="w-3.5 h-3.5" />
            {station.lastSeenAt
              ? `Last seen ${new Date(station.lastSeenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Never connected"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRevoke(station.id, station.name)}
          >
            <Unplug className="w-3.5 h-3.5" />
            Revoke
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StationsPage() {
  const { routeParams } = usePageContext();
  const businessId = routeParams.id;
  const qc = useQueryClient();

  const [pairOpen, setPairOpen] = useState(false);
  const [revoking, setRevoking] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stations", businessId],
    queryFn: () => stationService.listStations(businessId).then((r) => r.data.data),
  });

  const { mutate: revoke, isPending: isRevoking } = useMutation({
    mutationFn: ({ id }: { id: string; name: string }) =>
      stationService.revokeStation(businessId, id),
    onSuccess: (_data, { name }) => {
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      toast.success(`"${name}" has been revoked.`);
      setRevoking(null);
    },
    onError: () => toast.error("Failed to revoke station."),
  });

  const stations = data ?? [];
  const posCount = stations.filter((s) => s.type === "pos").length;
  const kdsCount = stations.filter((s) => s.type === "kds").length;
  const onlineCount = stations.filter((s) => isOnline(s.lastSeenAt)).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage POS terminals and kitchen displays linked to this business.
          </p>
        </div>
        <Button onClick={() => setPairOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Station
        </Button>
      </div>

      {/* Summary row */}
      {stations.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "POS Terminals", value: posCount, Icon: Monitor, color: "text-primary" },
            { label: "KDS Screens", value: kdsCount, Icon: ChefHat, color: "text-amber-600" },
            { label: "Online Now", value: onlineCount, Icon: Wifi, color: "text-green-600" },
          ].map(({ label, value, Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Station grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : stations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground border border-dashed rounded-2xl">
          <Monitor className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-semibold">No stations linked yet</p>
          <p className="text-sm mt-1 max-w-xs">
            Click "Add Station" to generate a pairing code, then enter it on any device running the station app.
          </p>
          <Button className="mt-6 gap-2" onClick={() => setPairOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Station
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((s) => (
            <StationCard
              key={s.id}
              station={s}
              businessId={businessId}
              onRevoke={(id, name) => setRevoking({ id, name })}
            />
          ))}
        </div>
      )}

      {/* Pairing dialog */}
      <PairingCodeDialog
        open={pairOpen}
        onOpenChange={setPairOpen}
        businessId={businessId}
      />

      {/* Revoke confirmation */}
      <AlertDialog open={!!revoking} onOpenChange={(v) => !v && setRevoking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke "{revoking?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The device will be immediately disconnected. It will need a new pairing code to reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revoke(revoking!)}
              disabled={isRevoking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRevoking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Revoke Station
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
