import { useState, useEffect, useCallback } from "react";
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
import StationQuickSettings from "@/components/station/StationQuickSettings";
import type { StationInfo } from "@/models/Station";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExpoItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  status: string;
}

interface ExpoStation {
  kitchenStationId: string | null;
  done: boolean;
  items: ExpoItem[];
}

interface ExpoOrder {
  id: string;
  status: string;
  tableName: string | null;
  kitchenNotes: string | null;
  priority: number;
  readyAt: string | null;
  createdAt: string;
  allStationsDone: boolean;
  requiresExpoConfirm: boolean;
  stations: ExpoStation[];
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

// ─── Expo Ticket ─────────────────────────────────────────────────────────────

function ExpoTicket({
  order,
  onConfirm,
  confirmingIds,
}: {
  order: ExpoOrder;
  onConfirm: (orderId: string) => void;
  confirmingIds: Set<string>;
}) {
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
      className={`flex flex-col border-2 bg-slate-900 shadow-2xl transition-all ${
        isReady
          ? "border-green-500 shadow-green-500/30"
          : order.allStationsDone
          ? "border-amber-500 shadow-amber-500/20"
          : "border-slate-700"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 rounded-t-lg flex flex-col gap-1.5 ${
          isReady
            ? "bg-green-500/15"
            : order.allStationsDone
            ? "bg-amber-500/10"
            : "bg-slate-950/30"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-black text-white">
              {order.tableName ?? "Takeaway"}
            </span>
            {order.priority > 0 && (
              <span className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                <Flame className="w-3 h-3" />
                Rush
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${ageColor(order.createdAt)}`}>
            <Clock className="w-4 h-4" />
            {formatAge(order.createdAt)}
          </div>
        </div>
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          #{order.id.slice(0, 8)}
        </p>
        {order.kitchenNotes && (
          <div className="flex items-start gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-300 leading-tight">{order.kitchenNotes}</p>
          </div>
        )}
        {/* Ready wait time — how long since the order became READY */}
        {isReady && order.readyAt && (
          <div className="flex items-center gap-1.5 text-green-400/70">
            <Timer className="w-3 h-3" />
            <span className="text-[10px] font-mono font-bold">
              Ready {formatAge(order.readyAt)} ago
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
                ? "bg-green-500/15 border-green-500/30 text-green-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            {s.done ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            <span>Station {idx + 1}</span>
            <span className="opacity-50">({s.items.length})</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800 rounded-b-lg mt-auto">
        {isReady ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-400">
            <CheckCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Ready — Awaiting Pickup</span>
          </div>
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
            Confirm & Send
          </Button>
        ) : order.allStationsDone ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-400/70">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">All Stations Done</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">In Progress</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── ExpoScreen ───────────────────────────────────────────────────────────────

export default function ExpoScreen({ station }: Props) {
  const [orders, setOrders] = useState<ExpoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const params: Record<string, string> = { expo: "true" };
      const maxAge = localStorage.getItem("kds_ready_max_age");
      if (maxAge) params.readyMaxAgeMinutes = maxAge;

      const res = await staffApi.get<{ data: ExpoOrder[] }>("/station/kds-orders", { params });
      const incoming: ExpoOrder[] = res.data.data ?? [];

      setOrders(
        [...incoming].sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
      );
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Poll every 12 seconds — expo is read-heavy
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 12_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const confirmExpo = useCallback(async (orderId: string) => {
    setConfirmingIds((prev) => new Set([...prev, orderId]));
    try {
      await staffApi.patch(
        `/station/kds-orders/${orderId}/expo-confirm`,
        {},
        { headers: { "X-Idempotency-Key": generateIdempotencyKey() } }
      );
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "ready" } : o)
      );
      toast.success("Order confirmed — ready for pickup!", { duration: 4000 });
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "order.items_not_ready") {
        toast.error("Some items are still being prepared.");
      } else if (code === "order.invalid_status") {
        toast.error("Order is not in a confirmable state.");
      } else {
        toast.error("Failed to confirm order.");
      }
      fetchOrders();
    } finally {
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, [fetchOrders]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Header */}
      <header className="h-16 flex items-center px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <CheckCheck className="w-6 h-6 text-green-400" />
          <div className="leading-none">
            <h1 className="font-black tracking-tight text-lg uppercase">Expo Station</h1>
            <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
              <Building2 className="w-2.5 h-2.5" />
              {station.business.name} · All Stations
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {orders.length > 0 && (
            <div className="flex items-center gap-2 bg-green-500/15 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-black text-green-400 uppercase tracking-widest">
                {orders.length} Orders
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
          <StationQuickSettings station={station} />
        </div>
      </header>

      {/* Tickets */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest">Loading orders...</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 bg-slate-950">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {orders.map((order) => (
              <ExpoTicket
                key={order.id}
                order={order}
                onConfirm={confirmExpo}
                confirmingIds={confirmingIds}
              />
            ))}
            {orders.length === 0 && (
              <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-slate-700">
                <CheckCheck className="w-20 h-20 mb-4 opacity-10" />
                <p className="font-black uppercase tracking-[0.3em] text-sm">All Clear</p>
                <p className="text-[10px] mt-2 italic font-bold">
                  No active orders across all stations
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
