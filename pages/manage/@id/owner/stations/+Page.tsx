import { useState, useEffect, useCallback, useMemo } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  stationService,
  kitchenStationService,
  categoryRuleService,
  type StationRecord,
  type KitchenStation,
  type CategoryRule,
} from "@/features/station/service";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Pencil, Trash2, UtensilsCrossed, GripVertical, ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000;
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

  useEffect(() => {
    if (open) generate();
  }, [open]);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

// ─── Station Card ─────────────────────────────────────────────────────────────

function StationCard({
  station,
  businessId,
  kitchenStations,
  onRevoke,
}: {
  station: StationRecord;
  businessId: string;
  kitchenStations: KitchenStation[];
  onRevoke: (id: string, name: string) => void;
}) {
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

// ─── Kitchen Station Card ─────────────────────────────────────────────────────

function KitchenStationCard({
  ks,
  businessId,
  onDelete,
}: {
  ks: KitchenStation;
  businessId: string;
  onDelete: (ks: KitchenStation) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ks.name);
  const qc = useQueryClient();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ks.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => kitchenStationService.update(businessId, ks.id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-stations", businessId] });
      setEditing(false);
      toast.success("Kitchen station renamed.");
    },
    onError: () => toast.error("Failed to rename."),
  });

  const statusColor: Record<KitchenStation["status"], string> = {
    ready: "bg-green-500/10 text-green-600 border-green-500/20",
    getting_ready: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    broken: "bg-destructive/10 text-destructive border-destructive/20",
    offline: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors group">
      <button
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <UtensilsCrossed className="w-4 h-4 text-amber-600" />
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 text-sm font-bold flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") { setEditing(false); setName(ks.name); }
              }}
            />
            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => save()} disabled={isPending}>
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
            </Button>
          </div>
        ) : (
          <p className="text-sm font-bold truncate">{ks.name}</p>
        )}
        <Badge
          variant="outline"
          className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${statusColor[ks.status]}`}
        >
          {ks.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive/50 hover:text-destructive"
          onClick={() => onDelete(ks)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Category Routing Panel ───────────────────────────────────────────────────

function CategoryRoutingPanel({
  businessId,
  kitchenStations,
}: {
  businessId: string;
  kitchenStations: KitchenStation[];
}) {
  const qc = useQueryClient();
  const { businessAllCategories } = useBusinessMenus(businessId);

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["category-rules", businessId],
    queryFn: () => categoryRuleService.list(businessId).then((r) => r.data.data),
  });

  const { mutate: assignRule, isPending: isAssigning } = useMutation({
    mutationFn: ({ categoryId, kitchenStationId }: { categoryId: string; kitchenStationId: string }) =>
      categoryRuleService.upsert(businessId, categoryId, kitchenStationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-rules", businessId] });
    },
    onError: () => toast.error("Failed to assign category rule."),
  });

  const { mutate: removeRule } = useMutation({
    mutationFn: (ruleId: string) => categoryRuleService.remove(businessId, ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-rules", businessId] });
    },
    onError: () => toast.error("Failed to remove category rule."),
  });

  const ruleMap = useMemo(
    () => new Map((rules ?? []).map((r: CategoryRule) => [r.categoryId, r])),
    [rules],
  );

  const categories = businessAllCategories ?? [];
  const loading = rulesLoading || !businessAllCategories;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          Category Routing
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Automatically route order items to a kitchen station based on their menu category.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-xl">
            No menu categories found. Add categories to your menus first.
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((cat) => {
              const rule = ruleMap.get(cat.id);
              return (
                <div key={cat.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <p className="flex-1 text-sm font-medium truncate">{cat.name}</p>
                  <Select
                    value={rule?.kitchenStationId ?? "none"}
                    onValueChange={(v) => {
                      if (v === "none") {
                        if (rule) removeRule(rule.id);
                      } else {
                        assignRule({ categoryId: cat.id, kitchenStationId: v });
                      }
                    }}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="h-8 w-48 text-xs">
                      <SelectValue placeholder="Not mapped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">Not mapped</span>
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
              );
            })}
          </div>
        )}
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
  const [deletingKs, setDeletingKs] = useState<KitchenStation | null>(null);
  const [newKsName, setNewKsName] = useState("");
  const [addingKs, setAddingKs] = useState(false);
  const [orderedKs, setOrderedKs] = useState<KitchenStation[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  const { data, isLoading } = useQuery({
    queryKey: ["stations", businessId],
    queryFn: () => stationService.listStations(businessId).then((r) => r.data.data),
  });

  const { data: kitchenStations, isLoading: ksLoading } = useQuery({
    queryKey: ["kitchen-stations", businessId],
    queryFn: () => kitchenStationService.list(businessId).then((r) => r.data.data),
  });

  useEffect(() => {
    setOrderedKs(kitchenStations ?? []);
  }, [kitchenStations]);

  const { mutate: reorderKs } = useMutation({
    mutationFn: (order: { id: string; sortOrder: number }[]) =>
      kitchenStationService.reorder(businessId, order),
    onSuccess: (res) => {
      qc.setQueryData(["kitchen-stations", businessId], res.data.data);
    },
    onError: () => {
      setOrderedKs(kitchenStations ?? []);
      toast.error("Failed to save order. Please try again.");
    },
  });

  const handleKsDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedKs((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      const order = reordered.map((s, i) => ({ id: s.id, sortOrder: i }));
      reorderKs(order);
      return reordered;
    });
  }, [reorderKs]);

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

  const { mutate: createKs, isPending: isCreatingKs } = useMutation({
    mutationFn: () => kitchenStationService.create(businessId, newKsName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-stations", businessId] });
      setNewKsName("");
      setAddingKs(false);
      toast.success("Kitchen station created.");
    },
    onError: () => toast.error("Failed to create kitchen station."),
  });

  const { mutate: deleteKs, isPending: isDeletingKs } = useMutation({
    mutationFn: (ks: KitchenStation) => kitchenStationService.remove(businessId, ks.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-stations", businessId] });
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      toast.success("Kitchen station deleted.");
      setDeletingKs(null);
    },
    onError: () => toast.error("Failed to delete kitchen station."),
  });

  const stations = data ?? [];
  const posCount = stations.filter((s) => s.type === "pos").length;
  const kdsCount = stations.filter((s) => s.type === "kds").length;
  const onlineCount = stations.filter((s) => isOnline(s.lastSeenAt)).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
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
        <div className="grid grid-cols-3 gap-4">
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

      {/* Kitchen Stations section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              Kitchen Stations
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setAddingKs((v) => !v)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Logical cooking areas (e.g. Grill, Fryer). Assign each KDS device to one of these.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {addingKs && (
            <div className="flex items-center gap-2 mb-1">
              <Input
                value={newKsName}
                onChange={(e) => setNewKsName(e.target.value)}
                placeholder="e.g. Grill, Fryer, Cold Station…"
                className="h-8 text-sm flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newKsName.trim()) createKs();
                  if (e.key === "Escape") { setAddingKs(false); setNewKsName(""); }
                }}
              />
              <Button
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={!newKsName.trim() || isCreatingKs}
                onClick={() => createKs()}
              >
                {isCreatingKs ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => { setAddingKs(false); setNewKsName(""); }}
              >
                Cancel
              </Button>
            </div>
          )}

          {ksLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : orderedKs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-xl">
              No kitchen stations yet. Add one to assign KDS devices.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleKsDragEnd}>
              <SortableContext items={orderedKs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {orderedKs.map((ks) => (
                  <KitchenStationCard
                    key={ks.id}
                    ks={ks}
                    businessId={businessId}
                    onDelete={setDeletingKs}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Category Routing */}
      <CategoryRoutingPanel businessId={businessId} kitchenStations={orderedKs} />

      {/* Station grid */}
      <div>
        <h2 className="text-base font-bold mb-3">Devices</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground border border-dashed rounded-2xl">
            <Monitor className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-semibold">No stations linked yet</p>
            <p className="text-sm mt-1 max-w-xs">
              Click "Add Station" to generate a pairing code, then enter it on any device running
              the station app.
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
                kitchenStations={kitchenStations ?? []}
                onRevoke={(id, name) => setRevoking({ id, name })}
              />
            ))}
          </div>
        )}
      </div>

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
              The device will be immediately disconnected. It will need a new pairing code to
              reconnect.
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

      {/* Delete kitchen station confirmation */}
      <AlertDialog open={!!deletingKs} onOpenChange={(v) => !v && setDeletingKs(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingKs?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Any KDS devices assigned to this station will lose their assignment. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKs(deletingKs!)}
              disabled={isDeletingKs}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingKs ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
