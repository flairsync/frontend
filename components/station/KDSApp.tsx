import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChefHat, Clock, CheckCircle2, AlertCircle,
  Utensils, Package, Building2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { stationApi, staffApi } from "@/features/station/station-api";
import StationQuickSettings from "@/components/station/StationQuickSettings";
import StaffPinScreen from "@/components/pos/StaffPinScreen";
import { useStaffSession } from "@/features/pos/useStaffSession";
import type { StationInfo } from "@/models/Station";

// ─── API types per kds_frontend_guide.md ─────────────────────────────────────

interface KdsOrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  selectedModifiers: { modifierItemId: string; name: string; price: number }[] | null;
  notes: string | null;
  status: "pending" | "sent" | "ready" | "served" | "cancelled" | "voided";
  kitchenStationIdSnapshot: string;
  createdAt: string;
}

interface KdsOrder {
  id: string;
  status: "accepted" | "preparing" | "ready";
  type: "dine_in" | "takeaway" | "delivery";
  tableId: string | null;
  tableName: string | null;
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

function formatAge(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Ticket Card ─────────────────────────────────────────────────────────────

function KdsTicketCard({
  order,
  onBumpItem,
  onBumpAll,
  onStartPreparing,
  bumpingItems,
  startingPreparing,
}: {
  order: KdsOrder;
  onBumpItem: (orderId: string, itemId: string) => void;
  onBumpAll: (order: KdsOrder) => void;
  onStartPreparing: (orderId: string) => void;
  bumpingItems: Set<string>;
  startingPreparing: Set<string>;
}) {
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
          : allStationItemsBumped
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
            : allStationItemsBumped
            ? "bg-green-500/5"
            : isAccepted
            ? "bg-amber-500/5"
            : "bg-slate-950/30"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
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
              {order.tableName ?? (order.type === "dine_in" ? "Dine In" : "Takeaway")}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${ageColor(order.createdAt)}`}>
              <Clock className="w-4 h-4" />
              {formatAge(order.createdAt)}
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
              {order.type.replace("_", " ")}
            </span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          #{order.id.slice(0, 8)}
        </p>
      </div>

      {/* Items */}
      <ScrollArea className="px-4 py-2" style={{ maxHeight: "260px" }}>
        <div className="space-y-3 py-1">
          {order.stationItems.map((item) => {
            const bumped = item.status !== "sent";
            const bumping = bumpingItems.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => !bumped && !bumping && onBumpItem(order.id, item.id)}
                className={`p-3 rounded-2xl transition-all border ${
                  bumped
                    ? "bg-slate-950/50 border-slate-900 opacity-30 cursor-default"
                    : bumping
                    ? "bg-slate-800/50 border-slate-700 cursor-wait"
                    : "bg-slate-800 hover:bg-slate-700 border-transparent cursor-pointer shadow-lg shadow-black/20 active:scale-95"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <span className={`text-xl font-black flex-shrink-0 ${bumped ? "text-slate-600" : "text-primary"}`}>
                      {item.quantity}×
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-black uppercase tracking-tight ${bumped ? "text-slate-500 line-through" : "text-white"}`}>
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
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {bumping ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : bumped ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
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
            {order.otherItemsCount} more item{order.otherItemsCount > 1 ? "s" : ""} from other stations
          </p>
        )}
        {isReady ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Ready for Pickup</span>
          </div>
        ) : allStationItemsBumped ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-400/70">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Station done — waiting for other stations
            </span>
          </div>
        ) : isAccepted ? (
          <Button
            className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-500/20"
            onClick={() => onStartPreparing(order.id)}
            disabled={startingPreparing.has(order.id)}
          >
            {startingPreparing.has(order.id) ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            START PREPARING
          </Button>
        ) : (
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10"
            onClick={() => onBumpAll(order)}
            disabled={sentItems.every((i) => bumpingItems.has(i.id))}
          >
            BUMP ALL ({sentItems.length})
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── KDS Main (authenticated) ─────────────────────────────────────────────────

function KDSMain({ station }: { station: StationInfo }) {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [bumpingItems, setBumpingItems] = useState<Set<string>>(new Set());
  const [startingPreparing, setStartingPreparing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const firstPollRef = useRef(true);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Station online on mount, offline on unmount
  useEffect(() => {
    stationApi.patch("/station/kds-station/status", { status: "ready" }).catch(() => {});
    return () => {
      stationApi.patch("/station/kds-station/status", { status: "offline" }).catch(() => {});
    };
  }, []);

  // Heartbeat every 60s
  useEffect(() => {
    const t = setInterval(() => {
      stationApi.post("/station/heartbeat").catch(() => {});
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await stationApi.get<{ data: KdsOrder[] }>("/station/kds-orders");
      const incoming: KdsOrder[] = res.data.data ?? [];

      if (!firstPollRef.current) {
        const newOrders = incoming.filter((o) => !knownIdsRef.current.has(o.id));
        if (newOrders.length > 0) {
          toast.info(`${newOrders.length} new order${newOrders.length > 1 ? "s" : ""} arrived`, {
            duration: 3000,
          });
        }
      }

      firstPollRef.current = false;
      knownIdsRef.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  // Poll every 6 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const bumpItem = useCallback(async (orderId: string, itemId: string) => {
    // Optimistic: mark item ready locally
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              stationItems: o.stationItems.map((i) =>
                i.id === itemId ? { ...i, status: "ready" as const } : i
              ),
            }
      )
    );
    setBumpingItems((prev) => new Set([...prev, itemId]));

    try {
      const res = await staffApi.patch(`/station/kds-orders/${orderId}/items/${itemId}/bump`);
      const { allItemsReady } = res.data.data;
      if (allItemsReady) {
        toast.success("Order complete — ready for pickup!", { duration: 4000 });
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          knownIdsRef.current.delete(orderId);
        }, 3000);
      }
    } catch {
      // next poll corrects state
    } finally {
      setBumpingItems((prev) => {
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
      await staffApi.patch(`/station/orders/${orderId}/prepare`);
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
      toast.error("Failed to start preparing — please try again.");
    } finally {
      setStartingPreparing((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, []);

  const sorted = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* Header */}
      <header className="h-16 flex items-center px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-primary" />
          <div className="leading-none">
            <h1 className="font-black tracking-tight text-lg uppercase">Kitchen Display</h1>
            <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
              <Building2 className="w-2.5 h-2.5" />
              {station.business.name} · {station.name}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {orders.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-black text-primary uppercase tracking-widest">
                {orders.length} Active
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
            {sorted.map((order) => (
              <KdsTicketCard
                key={order.id}
                order={order}
                onBumpItem={bumpItem}
                onBumpAll={bumpAll}
                onStartPreparing={startPreparing}
                bumpingItems={bumpingItems}
                startingPreparing={startingPreparing}
              />
            ))}
            {sorted.length === 0 && (
              <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-slate-700">
                <ChefHat className="w-20 h-20 mb-4 opacity-10" />
                <p className="font-black uppercase tracking-[0.3em] text-sm">Kitchen Clear</p>
                <p className="text-[10px] mt-2 italic font-bold">
                  Waiting for new orders from terminal...
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
  const { session } = useStaffSession();

  if (!station.kitchenStationId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-4">
        <ChefHat className="w-16 h-16 opacity-20" />
        <div className="text-center px-8">
          <p className="font-black uppercase tracking-widest text-sm text-white mb-2">
            No Kitchen Station Assigned
          </p>
          <p className="text-xs max-w-xs">
            Ask an owner to assign a kitchen station to this device in the dashboard under Stations.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <StaffPinScreen businessId={station.businessId} onLogin={() => {}} />;
  }

  return <KDSMain station={station} />;
}
