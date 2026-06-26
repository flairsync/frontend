import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChefHat, Clock, CheckCircle2, AlertCircle,
  Utensils, Package, Building2, Loader2, Undo2,
  Flame, Settings, ChevronUp, ChevronDown, Timer,
} from "lucide-react";
import { toast } from "sonner";
import { stationApi, staffApi } from "@/features/station/station-api";
import { useStationSocket } from "@/features/station/useStationSocket";
import { generateIdempotencyKey } from "@/features/station/offlineQueue";
import StationQuickSettings from "@/components/station/StationQuickSettings";
import StaffPinScreen from "@/components/pos/StaffPinScreen";
import { useStaffSession } from "@/features/pos/useStaffSession";
import type { StationInfo } from "@/models/Station";
import ExpoScreen from "@/components/station/ExpoScreen";

// ─── API types ────────────────────────────────────────────────────────────────

interface KdsOrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  selectedModifiers: { modifierItemId: string; name: string; price: number }[] | null;
  notes: string | null;
  status: "pending" | "sent" | "ready" | "served" | "cancelled" | "voided";
  kitchenStationIdSnapshot: string | null;
  createdAt: string;
  sentAt: string | null;
  readyAt: string | null;
}

interface KdsOrder {
  id: string;
  status: "accepted" | "preparing" | "ready";
  type: "dine_in" | "takeaway" | "delivery";
  tableId: string | null;
  tableName: string | null;
  kitchenNotes: string | null;
  priority: number;
  readyAt: string | null;
  requiresExpoConfirm: boolean;
  createdAt: string;
  stationItems: KdsOrderItem[];
  otherItemsCount: number;
  allItemsDone: boolean;
}

interface Props {
  station: StationInfo;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageColor(createdAt: string): string {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60_000;
  if (mins < 5) return "text-green-400";
  if (mins < 10) return "text-amber-400";
  return "text-red-400 animate-pulse";
}

function formatAge(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function itemAgeColor(sentAt: string | null): string {
  if (!sentAt) return "text-slate-500";
  const mins = (Date.now() - new Date(sentAt).getTime()) / 60_000;
  if (mins < 5) return "text-green-400";
  if (mins < 10) return "text-amber-400";
  return "text-red-400";
}

function formatItemAge(sentAt: string | null): string {
  if (!sentAt) return "--:--";
  const diff = Math.floor((Date.now() - new Date(sentAt).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPrepTime(sentAt: string | null, readyAt: string | null): string {
  if (!sentAt || !readyAt) return "";
  const diff = Math.floor((new Date(readyAt).getTime() - new Date(sentAt).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ value, t }: { value: number; t: TFunction }) {
  return (
    <span className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
      <Flame className="w-3 h-3" />
      {value > 1 ? t("kds_app.ticket.priority_value", { value }) : t("kds_app.ticket.rush")}
    </span>
  );
}

// ─── KDS Settings Popover ─────────────────────────────────────────────────────

function KdsSettingsPopover({
  readyMaxAge,
  onReadyMaxAgeChange,
}: {
  readyMaxAge: string;
  onReadyMaxAgeChange: (v: string) => void;
}) {
  const { t } = useTranslation("station");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-slate-900 border-slate-700 text-slate-100" align="end">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("kds_app.settings_popover.title")}</p>
          <div className="space-y-1.5">
            <Label htmlFor="ready-max-age" className="text-[11px] font-bold text-slate-300">
              {t("kds_app.settings_popover.hide_after_label")}
            </Label>
            <Input
              id="ready-max-age"
              type="number"
              min="1"
              placeholder={t("kds_app.settings_popover.never_placeholder")}
              value={readyMaxAge}
              onChange={(e) => onReadyMaxAgeChange(e.target.value)}
              className="h-8 bg-slate-800 border-slate-700 text-sm"
            />
            <p className="text-[10px] text-slate-500">{t("kds_app.settings_popover.hint")}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Ticket Card ─────────────────────────────────────────────────────────────

function KdsTicketCard({
  order,
  onBumpItem,
  onBumpAll,
  onStartPreparing,
  onRecallItem,
  onSetPriority,
  bumpingItems,
  startingPreparing,
  recallingItems,
  awaitingExpoConfirm,
}: {
  order: KdsOrder;
  onBumpItem: (orderId: string, itemId: string) => void;
  onBumpAll: (order: KdsOrder) => void;
  onStartPreparing: (orderId: string) => void;
  onRecallItem: (orderId: string, itemId: string) => void;
  onSetPriority: (orderId: string, priority: number) => void;
  bumpingItems: Set<string>;
  startingPreparing: Set<string>;
  recallingItems: Set<string>;
  awaitingExpoConfirm: boolean;
}) {
  const { t } = useTranslation("station");
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isAccepted = order.status === "accepted";
  const isPreparing = order.status === "preparing";
  const isReady = order.status === "ready";
  const sentItems = order.stationItems.filter((i) => i.status === "sent");
  const allStationItemsBumped = isPreparing && sentItems.length === 0;

  return (
    <Card
      className={`flex flex-col border-2 bg-slate-900 shadow-2xl transition-all ${
        isReady
          ? "border-green-500 shadow-green-500/20"
          : awaitingExpoConfirm || allStationItemsBumped
          ? "border-green-500/30"
          : isAccepted
          ? "border-amber-500/40 opacity-75"
          : "border-slate-700"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 rounded-t-lg flex flex-col gap-1.5 ${
          isReady
            ? "bg-green-500/15"
            : awaitingExpoConfirm || allStationItemsBumped
            ? "bg-green-500/5"
            : isAccepted
            ? "bg-amber-500/5"
            : "bg-slate-950/30"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`p-1.5 rounded-lg ${
                order.type === "dine_in"
                  ? "bg-primary/20 text-primary"
                  : "bg-amber-500/20 text-amber-500"
              }`}
            >
              {order.type === "dine_in" ? (
                <Utensils className="w-3.5 h-3.5" />
              ) : (
                <Package className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-2xl font-black text-white">
              {order.tableName ?? (order.type === "dine_in" ? t("kds_app.ticket.order_type_dine_in") : t("kds_app.ticket.order_type_takeaway"))}
            </span>
            {order.priority > 0 && <PriorityBadge value={order.priority} t={t} />}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${ageColor(order.createdAt)}`}>
              <Clock className="w-4 h-4" />
              {formatAge(order.createdAt)}
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              {t(`kds_app.ticket.order_type_labels.${order.type}`)}
            </span>
            {/* Priority stepper — only on in-progress tickets */}
            {(isPreparing || isAccepted) && (
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  onClick={() => onSetPriority(order.id, Math.max(0, order.priority - 1))}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-mono text-slate-500 w-4 text-center">{order.priority}</span>
                <button
                  onClick={() => onSetPriority(order.id, order.priority + 1)}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          #{order.id.slice(0, 8)}
        </p>
        {order.kitchenNotes && (
          <div className="mt-1.5 flex items-start gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-300 leading-tight">{order.kitchenNotes}</p>
          </div>
        )}
        {awaitingExpoConfirm && (
          <div className="mt-1 flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
            <Timer className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">{t("kds_app.ticket.waiting_for_expo")}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <ScrollArea className="px-4 py-2" style={{ maxHeight: "260px" }}>
        <div className="space-y-3 py-1">
          {order.stationItems.map((item) => {
            const isItemReady = item.status === "ready";
            const isNotSent = item.status !== "sent" && item.status !== "ready";
            const bumping = bumpingItems.has(item.id);
            const recalling = recallingItems.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => !isItemReady && !isNotSent && !bumping && !recalling && onBumpItem(order.id, item.id)}
                className={`p-3 rounded-2xl transition-all border ${
                  isNotSent
                    ? "bg-slate-950/50 border-slate-900 opacity-30 cursor-default"
                    : isItemReady
                    ? "bg-slate-950/50 border-slate-800 opacity-50 cursor-default"
                    : bumping || recalling
                    ? "bg-slate-800/50 border-slate-700 cursor-wait"
                    : "bg-slate-800 hover:bg-slate-700 border-transparent cursor-pointer shadow-lg shadow-black/20 active:scale-95"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <span className={`text-xl font-black flex-shrink-0 ${isItemReady || isNotSent ? "text-slate-600" : "text-primary"}`}>
                      {item.quantity}×
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isItemReady || isNotSent ? "text-slate-500 line-through" : "text-white"}`}>
                        {item.nameSnapshot}
                      </h4>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="mt-0.5 space-y-0.5">
                          {item.selectedModifiers.map((m) => (
                            <p key={m.modifierItemId} className="text-[10px] text-slate-400 font-bold">
                              + {m.name}
                            </p>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div className="mt-1 flex items-start gap-1.5 text-amber-400/80">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold italic leading-tight">"{item.notes}"</p>
                        </div>
                      )}
                      {/* Elapsed time for in-queue items */}
                      {item.status === "sent" && item.sentAt && (
                        <div className={`mt-1 flex items-center gap-1 ${itemAgeColor(item.sentAt)}`}>
                          <Timer className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[10px] font-mono font-bold">{formatItemAge(item.sentAt)}</span>
                        </div>
                      )}
                      {/* Prep time for finished items */}
                      {item.status === "ready" && item.sentAt && item.readyAt && (
                        <div className="mt-1 flex items-center gap-1 text-green-500/60">
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[10px] font-mono font-bold">
                            {t("kds_app.ticket.done_in", { time: formatPrepTime(item.sentAt, item.readyAt) })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    {bumping || recalling ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : isItemReady ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRecallItem(order.id, item.id);
                          }}
                          disabled={recalling}
                          title={t("kds_app.ticket.unbump_title")}
                          className="flex items-center gap-0.5 text-[9px] font-bold text-slate-500 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 rounded-md px-1.5 py-0.5 transition-colors mt-0.5"
                        >
                          <Undo2 className="w-2.5 h-2.5" />
                          {t("kds_app.ticket.recall")}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800 rounded-b-lg mt-auto">
        {order.otherItemsCount > 0 && (
          <p className="text-[10px] text-slate-500 font-bold text-center mb-2">
            {t("kds_app.ticket.other_items_count", { count: order.otherItemsCount })}
          </p>
        )}
        {isReady ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">{t("kds_app.ticket.ready_for_pickup")}</span>
          </div>
        ) : awaitingExpoConfirm ? (
          <div className="flex items-center justify-center gap-2 py-2 text-amber-400">
            <Timer className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("kds_app.ticket.awaiting_expo_confirmation")}</span>
          </div>
        ) : allStationItemsBumped ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-400/70">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t("kds_app.ticket.station_done_waiting")}
            </span>
          </div>
        ) : isAccepted ? (
          <Button
            className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-500/20"
            onClick={() => onStartPreparing(order.id)}
            disabled={startingPreparing.has(order.id)}
          >
            {startingPreparing.has(order.id) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t("kds_app.ticket.start_preparing")}
          </Button>
        ) : (
          <div className="flex gap-2">
            {order.priority === 0 && (
              <Button
                variant="outline"
                className="h-12 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                onClick={() => onSetPriority(order.id, 1)}
              >
                <Flame className="w-3.5 h-3.5 mr-1" />
                {t("kds_app.ticket.rush")}
              </Button>
            )}
            <Button
              className="flex-1 h-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10"
              onClick={() => onBumpAll(order)}
              disabled={sentItems.every((i) => bumpingItems.has(i.id))}
            >
              {t("kds_app.ticket.bump_all", { count: sentItems.length })}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── KDS Main (authenticated) ─────────────────────────────────────────────────

function KDSMain({ station }: { station: StationInfo }) {
  const { t } = useTranslation("station");
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [bumpingItems, setBumpingItems] = useState<Set<string>>(new Set());
  const [recallingItems, setRecallingItems] = useState<Set<string>>(new Set());
  const [startingPreparing, setStartingPreparing] = useState<Set<string>>(new Set());
  const [awaitingExpoOrders, setAwaitingExpoOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stationUnassigned, setStationUnassigned] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [readyMaxAge, setReadyMaxAge] = useState(
    () => localStorage.getItem("kds_ready_max_age") ?? ""
  );
  const knownIdsRef = useRef<Set<string>>(new Set());
  const firstPollRef = useRef(true);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    stationApi.patch("/station/kds-station/status", { status: "ready" }).catch(() => {});
    return () => {
      stationApi.patch("/station/kds-station/status", { status: "offline" }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      stationApi.post("/station/heartbeat").catch(() => {});
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (readyMaxAge) {
      localStorage.setItem("kds_ready_max_age", readyMaxAge);
    } else {
      localStorage.removeItem("kds_ready_max_age");
    }
  }, [readyMaxAge]);

  const fetchOrders = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      const maxAge = localStorage.getItem("kds_ready_max_age");
      if (maxAge) params.readyMaxAgeMinutes = maxAge;

      // staffApi sends X-Staff-Token when a session exists, which handles kdsRequiresStaffAuth.
      // Its 401 interceptor clears the session and the component re-renders to show PIN screen.
      const res = await staffApi.get<{ data: KdsOrder[] }>("/station/kds-orders", { params });
      const incoming: KdsOrder[] = res.data.data ?? [];

      if (!firstPollRef.current) {
        const newOrders = incoming.filter((o) => !knownIdsRef.current.has(o.id));
        if (newOrders.length > 0) {
          toast.info(t("kds_app.toasts.new_orders_arrived", { count: newOrders.length }), {
            duration: 3000,
          });
        }
      }

      firstPollRef.current = false;
      knownIdsRef.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
      setStationUnassigned(false);
      setLoading(false);
    } catch (err: any) {
      if (err?.response?.status === 400) {
        setStationUnassigned(true);
        setLoading(false);
        return;
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 60_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useStationSocket(useCallback(() => {
    fetchOrders();
  }, [fetchOrders]));

  const bumpItem = useCallback(async (orderId: string, itemId: string) => {
    // Optimistic: mark item ready locally
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              stationItems: o.stationItems.map((i) =>
                i.id === itemId ? { ...i, status: "ready" as const, readyAt: new Date().toISOString() } : i
              ),
            }
      )
    );
    setBumpingItems((prev) => new Set([...prev, itemId]));

    try {
      const res = await staffApi.patch(
        `/station/kds-orders/${orderId}/items/${itemId}/bump`,
        {},
        { headers: { "X-Idempotency-Key": generateIdempotencyKey() } },
      );
      const { allItemsReady, awaitingExpoConfirm } = res.data.data ?? {};

      if (awaitingExpoConfirm) {
        setAwaitingExpoOrders((prev) => new Set([...prev, orderId]));
      } else if (allItemsReady) {
        toast.success(t("kds_app.toasts.order_complete"), { duration: 4000 });
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          knownIdsRef.current.delete(orderId);
        }, 3000);
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error(t("kds_app.toasts.item_not_assigned"));
        fetchOrders();
        return;
      }
      // next poll corrects state on other errors
    } finally {
      setBumpingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [fetchOrders]);

  const recallItem = useCallback(async (orderId: string, itemId: string) => {
    setRecallingItems((prev) => new Set([...prev, itemId]));
    try {
      const res = await staffApi.patch(
        `/station/kds-orders/${orderId}/items/${itemId}/recall`,
        {},
        { headers: { "X-Idempotency-Key": generateIdempotencyKey() } },
      );
      const { orderStatus } = res.data.data ?? {};

      setOrders((prev) =>
        prev.map((o) =>
          o.id !== orderId
            ? o
            : {
                ...o,
                status: (orderStatus ?? o.status) as KdsOrder["status"],
                stationItems: o.stationItems.map((i) =>
                  i.id === itemId ? { ...i, status: "sent" as const, readyAt: null } : i
                ),
              }
        )
      );
      if (orderStatus === "preparing") {
        setAwaitingExpoOrders((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error(t("kds_app.toasts.item_not_assigned"));
        return;
      }
      toast.error(t("kds_app.toasts.recall_failed"));
    } finally {
      setRecallingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, []);

  const bumpAll = useCallback(
    async (order: KdsOrder) => {
      const sentItems = order.stationItems.filter((i) => i.status === "sent");
      for (const item of sentItems) {
        await bumpItem(order.id, item.id);
      }
    },
    [bumpItem]
  );

  const startPreparing = useCallback(async (orderId: string) => {
    setStartingPreparing((prev) => new Set([...prev, orderId]));
    try {
      await staffApi.patch(`/station/orders/${orderId}/prepare`, {}, {
        headers: { "X-Idempotency-Key": generateIdempotencyKey() },
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id !== orderId
            ? o
            : {
                ...o,
                status: "preparing" as const,
                stationItems: o.stationItems.map((i) =>
                  i.status === "pending" ? { ...i, status: "sent" as const } : i
                ),
              }
        )
      );
    } catch {
      toast.error(t("kds_app.toasts.start_preparing_failed"));
    } finally {
      setStartingPreparing((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, []);

  const setPriority = useCallback(async (orderId: string, priority: number) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, priority } : o)
    );
    try {
      await staffApi.patch(`/station/kds-orders/${orderId}/priority`, { priority });
    } catch {
      toast.error(t("kds_app.toasts.priority_update_failed"));
      fetchOrders();
    }
  }, [fetchOrders]);

  // Sort: priority DESC, createdAt ASC
  const sorted = [...orders].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Header */}
      <header className="h-16 flex items-center px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-primary" />
          <div className="leading-none">
            <h1 className="font-black tracking-tight text-lg uppercase">{t("kds_app.header.title")}</h1>
            <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
              <Building2 className="w-2.5 h-2.5" />
              {station.business.name} · {station.name}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {orders.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-black text-primary uppercase tracking-widest">
                {t("kds_app.header.active_orders_count", { count: orders.length })}
              </span>
            </div>
          )}
          <div className="flex flex-col items-end leading-none">
            <p className="text-xl font-black font-mono text-white tracking-widest">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
          <Separator orientation="vertical" className="h-8 bg-slate-800" />
          <KdsSettingsPopover readyMaxAge={readyMaxAge} onReadyMaxAgeChange={setReadyMaxAge} />
          <StationQuickSettings station={station} />
        </div>
      </header>

      {/* Tickets */}
      {stationUnassigned ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
          <ChefHat className="w-16 h-16 opacity-20" />
          <div className="text-center px-8">
            <p className="font-black uppercase tracking-widest text-sm text-white mb-2">
              {t("kds_app.station_unassigned.title")}
            </p>
            <p className="text-xs max-w-xs leading-relaxed">
              {t("kds_app.station_unassigned.description")}
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest">{t("kds_app.loading")}</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 bg-slate-950">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {sorted.map((order) => (
              <KdsTicketCard
                key={order.id}
                order={order}
                onBumpItem={bumpItem}
                onBumpAll={bumpAll}
                onStartPreparing={startPreparing}
                onRecallItem={recallItem}
                onSetPriority={setPriority}
                bumpingItems={bumpingItems}
                startingPreparing={startingPreparing}
                recallingItems={recallingItems}
                awaitingExpoConfirm={awaitingExpoOrders.has(order.id)}
              />
            ))}
            {sorted.length === 0 && (
              <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-slate-700">
                <ChefHat className="w-20 h-20 mb-4 opacity-10" />
                <p className="font-black uppercase tracking-[0.3em] text-sm">{t("kds_app.empty_state.title")}</p>
                <p className="text-[10px] mt-2 italic font-bold">
                  {t("kds_app.empty_state.description")}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── KDSApp entry (guards) ────────────────────────────────────────────────────

export default function KDSApp({ station }: Props) {
  const { t } = useTranslation("station");
  const { session } = useStaffSession();
  const kdsMode = typeof window !== "undefined" ? localStorage.getItem("kds_mode") : null;

  if (!session) {
    return <StaffPinScreen businessId={station.businessId} onLogin={() => {}} />;
  }

  if (kdsMode === "expo") {
    return <ExpoScreen station={station} />;
  }

  if (!station.kitchenStationId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <ChefHat className="w-16 h-16 opacity-20" />
        <div className="text-center px-8">
          <p className="font-black uppercase tracking-widest text-sm text-white mb-2">
            {t("kds_app.no_kitchen_station.title")}
          </p>
          <p className="text-xs max-w-xs">
            {t("kds_app.no_kitchen_station.description")}
          </p>
        </div>
      </div>
    );
  }

  return <KDSMain station={station} />;
}
