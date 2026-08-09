import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  stationService,
  type StationRecord,
  type KitchenStation,
  type PrinterType,
} from "@/features/station/service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor, ChefHat, Unplug, Wifi, WifiOff, Clock, Loader2, Printer, PlugZap, Usb,
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/dateUtils";
import { isOnline } from "@/components/management/stations/utils";
import {
  isWebUsbSupported,
  pairPrinter,
  getPairedPrinterHint,
  clearPairedPrinterHint,
  testWebUsbPrint,
  type PairedPrinterInfo,
} from "@/features/station/webusb-printer";

// ─── Station Card ─────────────────────────────────────────────────────────────

interface StationCardProps {
  station: StationRecord;
  businessId: string;
  kitchenStations: KitchenStation[];
  onRevoke: (id: string, name: string) => void;
}

export function StationCard({ station, businessId, kitchenStations, onRevoke }: StationCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(station.name);
  const qc = useQueryClient();

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () => stationService.updateStation(businessId, station.id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      setEditing(false);
      toast.success("Station renamed.");
    },
    onError: () => toast.error("Failed to rename station."),
  });

  const { mutate: assignKs, isPending: isAssigning } = useMutation({
    mutationFn: (kitchenStationId: string | null) =>
      stationService.updateStation(businessId, station.id, { kitchenStationId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      toast.success("Kitchen station assigned.");
    },
    onError: () => toast.error("Failed to assign kitchen station."),
  });

  const [editingPrinter, setEditingPrinter] = useState(false);
  const [printerType, setPrinterType] = useState<PrinterType>(station.printerType);
  const [printerHost, setPrinterHost] = useState(station.printerHost ?? "");
  const [printerPort, setPrinterPort] = useState(String(station.printerPort ?? 9100));
  const [hasCashDrawer, setHasCashDrawer] = useState(station.hasCashDrawer);

  const { mutate: savePrinter, isPending: isSavingPrinter } = useMutation({
    mutationFn: () =>
      stationService.updateStation(businessId, station.id, {
        printerType,
        printerHost: printerType === "escpos_network" ? printerHost || null : null,
        printerPort: printerType === "escpos_network" ? parseInt(printerPort, 10) || 9100 : null,
        hasCashDrawer,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      setEditingPrinter(false);
      toast.success("Printer settings saved.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to save printer settings."),
  });

  const { mutate: testPrinter, isPending: isTestingPrinter } = useMutation({
    mutationFn: () => stationService.testPrinter(businessId, station.id),
    onSuccess: (res) => {
      const result = res.data.data;
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    },
    onError: () => toast.error("Failed to reach printer."),
  });

  // WebUSB: entirely client-side, no host/port, no backend call for pairing or testing —
  // navigator.usb handles both directly. pairedInfo mirrors the browser's own per-origin
  // WebUSB grant (see webusb-printer.ts) purely so this UI can show "Paired: <name>" without
  // re-prompting on every load.
  const [pairedInfo, setPairedInfo] = useState<PairedPrinterInfo | null>(() =>
    getPairedPrinterHint(station.id),
  );
  const { mutate: pairUsbPrinter, isPending: isPairing } = useMutation({
    mutationFn: () => pairPrinter(station.id),
    onSuccess: (info) => {
      setPairedInfo(info);
      toast.success(`Paired with ${info.productName}.`);
    },
    onError: (err: any) => {
      if (err?.name === "NotFoundError") return; // user closed the device picker — not an error
      toast.error(err?.message || "Failed to pair the USB printer.");
    },
  });
  const { mutate: testUsbPrinter, isPending: isTestingUsb } = useMutation({
    mutationFn: () => testWebUsbPrint(station.id),
    onSuccess: (result) => {
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    },
    onError: () => toast.error("Failed to reach the USB printer."),
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
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => save()} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
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

          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
            online ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
          }`}>
            {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {online ? "Online" : "Offline"}
          </div>
        </div>

        {/* KDS — kitchen station assignment */}
        {station.type === "kds" && (
          <div className="mb-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
              Kitchen Station
            </Label>
            <Select
              value={station.kitchenStationId ?? "none"}
              onValueChange={(v) => assignKs(v === "none" ? null : v)}
              disabled={isAssigning}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Not assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Not assigned</span>
                </SelectItem>
                {kitchenStations.map((ks) => (
                  <SelectItem key={ks.id} value={ks.id}>
                    {ks.name}
                    {!ks.active && (
                      <span className="ml-1 text-muted-foreground">(inactive)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* POS — physical receipt printer / cash drawer (GAP-08) */}
        {station.type === "pos" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Printer className="w-3 h-3" /> Printer
              </Label>
              {!editingPrinter && (
                <button
                  onClick={() => setEditingPrinter(true)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  {station.printerType === "none" ? "Configure" : "Edit"}
                </button>
              )}
            </div>

            {editingPrinter ? (
              <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
                <a
                  href="/learn#14-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline"
                >
                  How do I connect a printer or cash drawer?
                </a>
                <Select value={printerType} onValueChange={(v) => setPrinterType(v as PrinterType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No printer</SelectItem>
                    <SelectItem value="escpos_network">Network printer (ESC/POS)</SelectItem>
                    <SelectItem value="webusb">USB printer (browser-direct)</SelectItem>
                  </SelectContent>
                </Select>

                {printerType === "escpos_network" && (
                  <div className="flex gap-2">
                    <Input
                      value={printerHost}
                      onChange={(e) => setPrinterHost(e.target.value)}
                      placeholder="192.168.1.50"
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      value={printerPort}
                      onChange={(e) => setPrinterPort(e.target.value.replace(/\D/g, ""))}
                      placeholder="9100"
                      className="h-8 text-xs w-20"
                    />
                  </div>
                )}

                {printerType === "webusb" && (
                  !isWebUsbSupported() ? (
                    <p className="text-[10px] text-destructive">
                      This browser doesn't support WebUSB — use Chrome or Edge on this station's device.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-muted-foreground truncate">
                          {pairedInfo ? `Paired: ${pairedInfo.productName}` : "No printer paired yet"}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => pairUsbPrinter()}
                            disabled={isPairing}
                          >
                            {isPairing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Usb className="w-3 h-3" />}
                            {pairedInfo ? "Re-pair" : "Pair"}
                          </Button>
                          {pairedInfo && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                clearPairedPrinterHint(station.id);
                                setPairedInfo(null);
                              }}
                            >
                              Unpair
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        The printer must be connected via USB to this exact device/browser — pairing doesn't
                        transfer to other stations.
                      </p>
                    </div>
                  )
                )}

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Has cash drawer</Label>
                  <Switch checked={hasCashDrawer} onCheckedChange={setHasCashDrawer} />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => savePrinter()} disabled={isSavingPrinter}>
                    {isSavingPrinter ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setEditingPrinter(false);
                      setPrinterType(station.printerType);
                      setPrinterHost(station.printerHost ?? "");
                      setPrinterPort(String(station.printerPort ?? 9100));
                      setHasCashDrawer(station.hasCashDrawer);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {station.printerType === "none"
                    ? "Not configured"
                    : station.printerType === "webusb"
                      ? `${pairedInfo ? `Paired: ${pairedInfo.productName}` : "Not paired yet"}${station.hasCashDrawer ? " · Cash drawer" : ""}`
                      : `${station.printerHost}:${station.printerPort}${station.hasCashDrawer ? " · Cash drawer" : ""}`}
                </p>
                {station.printerType === "escpos_network" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => testPrinter()}
                    disabled={isTestingPrinter}
                  >
                    {isTestingPrinter ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlugZap className="w-3 h-3" />}
                    Test
                  </Button>
                )}
                {station.printerType === "webusb" && pairedInfo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => testUsbPrinter()}
                    disabled={isTestingUsb}
                  >
                    {isTestingUsb ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlugZap className="w-3 h-3" />}
                    Test
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <Separator className="mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Clock className="w-3.5 h-3.5" />
            {station.lastSeenAt
              ? `Last seen ${formatTime(station.lastSeenAt)}`
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
