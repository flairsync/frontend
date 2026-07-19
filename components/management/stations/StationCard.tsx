import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  stationService,
  type StationRecord,
  type KitchenStation,
} from "@/features/station/service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor, ChefHat, Unplug, Wifi, WifiOff, Clock, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/dateUtils";
import { isOnline } from "@/components/management/stations/utils";

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
