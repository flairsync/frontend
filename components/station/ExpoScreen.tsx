import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2, AlertCircle, Loader2, Building2,
  Clock, Flame, Timer, CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { staffApi } from "@/features/station/station-api";
import { generateIdempotencyKey } from "@/features/station/offlineQueue";
import { useExpoOrders, EXPO_ORDERS_QUERY_KEY } from "@/features/station/useExpoOrders";
import type { ExpoOrder } from "@/features/station/expo.service";
import StationQuickSettings from "@/components/station/StationQuickSettings";
import type { StationInfo } from "@/models/Station";

interface Props {
  station: StationInfo;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageColor(createdAt: string): string {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60_000;
  if (mins < 5) return "text-green-600";
  if (mins < 10) return "text-amber-600";
  return "text-red-600 animate-pulse";
}

function formatAge(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Expo Ticket ─────────────────────────────────────────────────────────────

function ExpoTicket({
  order,
  onConfirm,
  confirmingIds,
  onMarkServed,
  markingServedIds,
}: {
  order: ExpoOrder;
  onConfirm: (orderId: string) => void;
  confirmingIds: Set<string>;
  onMarkServed: (orderId: string) => void;
  markingServedIds: Set<string>;
}) {
  const { t } = useTranslation("station");
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isReady = order.status === "ready";
  const needsConfirm = order.allStationsDone && order.requiresExpoConfirm && !isReady;
  const confirming = confirmingIds.has(order.id);

  return (
    <Card
      className={`flex flex-col border-2 bg-card shadow-2xl transition-all ${
        isReady
          ? "border-green-500 shadow-green-500/30"
          : order.allStationsDone
          ? "border-amber-500 shadow-amber-500/20"
          : "border-border"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 rounded-t-lg flex flex-col gap-1.5 ${
          isReady
            ? "bg-green-500/15"
            : order.allStationsDone
            ? "bg-amber-500/10"
            : "bg-muted/70"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-black text-foreground">
              {order.tableName ?? t("expo_screen.ticket.takeaway")}
            </span>
            {order.priority > 0 && (
              <span className="flex items-center gap-1 bg-red-500/20 text-red-600 border border-red-500/30 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                <Flame className="w-3 h-3" />
                {t("expo_screen.ticket.rush")}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${ageColor(order.createdAt)}`}>
            <Clock className="w-4 h-4" />
            {formatAge(order.createdAt)}
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
          #{order.id.slice(0, 8)}
        </p>
        {order.kitchenNotes && (
          <div className="flex items-start gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-800 leading-tight">{order.kitchenNotes}</p>
          </div>
        )}
        {/* Ready wait time — how long since the order became READY */}
        {isReady && order.readyAt && (
          <div className="flex items-center gap-1.5 text-green-600/70">
            <Timer className="w-3 h-3" />
            <span className="text-[10px] font-mono font-bold">
              {t("expo_screen.ticket.ready_ago", { time: formatAge(order.readyAt) })}
            </span>
          </div>
        )}
      </div>

      {/* Station pills */}
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {order.stations.map((s, idx) => (
          <div
            key={s.kitchenStationId ?? idx}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
              s.done
                ? "bg-green-500/15 border-green-500/30 text-green-600"
                : "bg-amber-500/10 border-amber-500/20 text-amber-600"
            }`}
          >
            {s.done ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            <span>{t("expo_screen.ticket.station_pill", { index: idx + 1 })}</span>
            <span className="opacity-50">({s.items.length})</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-muted/70 border-t border-border rounded-b-lg mt-auto">
        {isReady ? (
          <Button
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/20"
            onClick={() => onMarkServed(order.id)}
            disabled={markingServedIds.has(order.id)}
          >
            {markingServedIds.has(order.id) ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {t("expo_screen.ticket.mark_served")}
          </Button>
        ) : needsConfirm ? (
          <Button
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/20"
            onClick={() => onConfirm(order.id)}
            disabled={confirming}
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            {t("expo_screen.ticket.confirm_and_send")}
          </Button>
        ) : order.allStationsDone ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-600/70">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("expo_screen.ticket.all_stations_done")}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("expo_screen.ticket.in_progress")}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── ExpoScreen ───────────────────────────────────────────────────────────────

export default function ExpoScreen({ station }: Props) {
  const { t } = useTranslation("station");
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading: loading, refetch } = useExpoOrders();
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [markingServedIds, setMarkingServedIds] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const confirmExpo = useCallback(async (orderId: string) => {
    setConfirmingIds((prev) => new Set([...prev, orderId]));
    try {
      await staffApi.patch(
        `/station/kds-orders/${orderId}/expo-confirm`,
        {},
        { headers: { "X-Idempotency-Key": generateIdempotencyKey() } }
      );
      queryClient.setQueryData<ExpoOrder[]>(EXPO_ORDERS_QUERY_KEY, (prev) =>
        prev?.map((o) => o.id === orderId ? { ...o, status: "ready" } : o)
      );
      toast.success(t("expo_screen.toasts.confirm_success"), { duration: 4000 });
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "order.items_not_ready") {
        toast.error(t("expo_screen.toasts.items_not_ready"));
      } else if (code === "order.invalid_status") {
        toast.error(t("expo_screen.toasts.invalid_status"));
      } else {
        toast.error(t("expo_screen.toasts.confirm_failed"));
      }
      refetch();
    } finally {
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, [queryClient, refetch, t]);

  const markServed = useCallback(async (orderId: string) => {
    setMarkingServedIds((prev) => new Set([...prev, orderId]));
    try {
      await staffApi.patch(`/station/orders/${orderId}/served`, {}, {
        headers: { "X-Idempotency-Key": generateIdempotencyKey() },
      });
      queryClient.setQueryData<ExpoOrder[]>(EXPO_ORDERS_QUERY_KEY, (prev) =>
        prev?.filter((o) => o.id !== orderId)
      );
    } catch {
      toast.error(t("expo_screen.toasts.mark_served_failed"));
    } finally {
      setMarkingServedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, [queryClient, t]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans antialiased">
      {/* Header */}
      <header className="h-16 flex items-center px-6 bg-card border-b border-border flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <CheckCheck className="w-6 h-6 text-green-600" />
          <div className="leading-none">
            <h1 className="font-black tracking-tight text-lg uppercase">{t("expo_screen.header.title")}</h1>
            <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 mt-0.5">
              <Building2 className="w-2.5 h-2.5" />
              {t("expo_screen.header.business_all_stations", { businessName: station.business.name })}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {orders.length > 0 && (
            <div className="flex items-center gap-2 bg-green-500/15 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-black text-green-600 uppercase tracking-widest">
                {t("expo_screen.header.active_orders_count", { count: orders.length })}
              </span>
            </div>
          )}
          <div className="flex flex-col items-end leading-none">
            <p className="text-xl font-black font-mono text-foreground tracking-widest">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
          <StationQuickSettings station={station} />
        </div>
      </header>

      {/* Tickets */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest">{t("expo_screen.loading")}</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 bg-background">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {orders.map((order) => (
              <ExpoTicket
                key={order.id}
                order={order}
                onConfirm={confirmExpo}
                confirmingIds={confirmingIds}
                onMarkServed={markServed}
                markingServedIds={markingServedIds}
              />
            ))}
            {orders.length === 0 && (
              <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
                <CheckCheck className="w-20 h-20 mb-4 opacity-10" />
                <p className="font-black uppercase tracking-[0.3em] text-sm">{t("expo_screen.empty_state.title")}</p>
                <p className="text-[10px] mt-2 italic font-bold">
                  {t("expo_screen.empty_state.description")}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
