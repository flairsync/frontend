import { useState, useEffect, useCallback } from "react";
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
} from "@dnd-kit/sortable";
import {
  stationService,
  kitchenStationService,
  type KitchenStation,
} from "@/features/station/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Monitor, ChefHat, Plus, Wifi, Loader2, UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { PairingCodeDialog } from "@/components/management/stations/PairingCodeDialog";
import { StationCard } from "@/components/management/stations/StationCard";
import { KitchenStationCard } from "@/components/management/stations/KitchenStationCard";
import { CategoryRoutingPanel } from "@/components/management/stations/CategoryRoutingPanel";
import { isOnline } from "@/components/management/stations/utils";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              Click "Add Station" to generate a pairing code, then scan the QR code (or enter the
              code manually) on any device running the station app.
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
