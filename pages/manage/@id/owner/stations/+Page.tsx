import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("management");
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
      toast.error(t("stations_page.kitchen_stations.order_save_failed"));
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
      toast.success(t("stations_page.revoke_dialog.success_toast", { name }));
      setRevoking(null);
    },
    onError: () => toast.error(t("stations_page.revoke_dialog.failed_toast")),
  });

  const { mutate: createKs, isPending: isCreatingKs } = useMutation({
    mutationFn: () => kitchenStationService.create(businessId, newKsName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-stations", businessId] });
      setNewKsName("");
      setAddingKs(false);
      toast.success(t("stations_page.kitchen_stations.created_toast"));
    },
    onError: () => toast.error(t("stations_page.kitchen_stations.create_failed_toast")),
  });

  const { mutate: deleteKs, isPending: isDeletingKs } = useMutation({
    mutationFn: (ks: KitchenStation) => kitchenStationService.remove(businessId, ks.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-stations", businessId] });
      qc.invalidateQueries({ queryKey: ["stations", businessId] });
      toast.success(t("stations_page.kitchen_stations.deleted_toast"));
      setDeletingKs(null);
    },
    onError: () => toast.error(t("stations_page.kitchen_stations.delete_failed_toast")),
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
          <h1 className="text-2xl font-bold tracking-tight">{t("stations_page.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("stations_page.subtitle")}
          </p>
        </div>
        <Button onClick={() => setPairOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("stations_page.add_station")}
        </Button>
      </div>

      {/* Summary row */}
      {stations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: t("stations_page.summary.pos_terminals"), value: posCount, Icon: Monitor, color: "text-primary" },
            { label: t("stations_page.summary.kds_screens"), value: kdsCount, Icon: ChefHat, color: "text-amber-600" },
            { label: t("stations_page.summary.online_now"), value: onlineCount, Icon: Wifi, color: "text-green-600" },
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
              {t("stations_page.kitchen_stations.title")}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setAddingKs((v) => !v)}
            >
              <Plus className="w-3.5 h-3.5" />
              {t("stations_page.kitchen_stations.add")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("stations_page.kitchen_stations.description")}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {addingKs && (
            <div className="flex items-center gap-2 mb-1">
              <Input
                value={newKsName}
                onChange={(e) => setNewKsName(e.target.value)}
                placeholder={t("stations_page.kitchen_stations.name_placeholder")}
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
                {isCreatingKs ? <Loader2 className="w-3 h-3 animate-spin" /> : t("stations_page.kitchen_stations.create")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => { setAddingKs(false); setNewKsName(""); }}
              >
                {t("stations_page.kitchen_stations.cancel")}
              </Button>
            </div>
          )}

          {ksLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : orderedKs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-xl">
              {t("stations_page.kitchen_stations.empty")}
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
        <h2 className="text-base font-bold mb-3">{t("stations_page.devices.title")}</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground border border-dashed rounded-2xl">
            <Monitor className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-semibold">{t("stations_page.devices.empty_title")}</p>
            <p className="text-sm mt-1 max-w-xs">
              {t("stations_page.devices.empty_description")}
            </p>
            <Button className="mt-6 gap-2" onClick={() => setPairOpen(true)}>
              <Plus className="w-4 h-4" />
              {t("stations_page.add_station")}
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
            <AlertDialogTitle>{t("stations_page.revoke_dialog.title", { name: revoking?.name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("stations_page.revoke_dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("stations_page.kitchen_stations.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revoke(revoking!)}
              disabled={isRevoking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRevoking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("stations_page.revoke_dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete kitchen station confirmation */}
      <AlertDialog open={!!deletingKs} onOpenChange={(v) => !v && setDeletingKs(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stations_page.delete_ks_dialog.title", { name: deletingKs?.name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("stations_page.delete_ks_dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("stations_page.kitchen_stations.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKs(deletingKs!)}
              disabled={isDeletingKs}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingKs ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("stations_page.delete_ks_dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
