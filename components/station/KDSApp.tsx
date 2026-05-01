import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChefHat, Clock, CheckCircle2, AlertCircle,
  Trash2, RotateCcw, Utensils, Package, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { PosModeSwitcher } from "@/components/pos/PosModeSwitcher";
import { stationApi } from "@/features/station/station-api";
import StationQuickSettings from "@/components/station/StationQuickSettings";
import type { StationInfo } from "@/models/Station";

interface KdsItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  isCompleted?: boolean;
}

interface KdsOrder {
  id: string;
  orderNumber: string;
  tableName?: string;
  mode: "dine-in" | "takeaway";
  items: KdsItem[];
  createdAt: Date;
  status: "pending" | "preparing" | "ready";
}

const MOCK_KDS_ORDERS: KdsOrder[] = [
  {
    id: "k1",
    orderNumber: "101",
    tableName: "Table 4",
    mode: "dine-in",
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
    status: "preparing",
    items: [
      { id: "it1", name: "Margarita Pizza", quantity: 2, notes: "Extra cheese" },
      { id: "it2", name: "Espresso", quantity: 1 },
    ],
  },
  {
    id: "k2",
    orderNumber: "102",
    mode: "takeaway",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    status: "pending",
    items: [
      { id: "it3", name: "Cheeseburger", quantity: 1, notes: "No onions" },
      { id: "it4", name: "Latte", quantity: 2 },
    ],
  },
  {
    id: "k3",
    orderNumber: "103",
    tableName: "Table 1",
    mode: "dine-in",
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
    status: "pending",
    items: [{ id: "it5", name: "Pepperoni Pizza", quantity: 1 }],
  },
];

interface Props {
  station: StationInfo;
}

export default function KDSApp({ station }: Props) {
  const [orders, setOrders] = useState<KdsOrder[]>(MOCK_KDS_ORDERS);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Heartbeat — keeps station "online" status current in dashboard
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await stationApi.post("/station/heartbeat");
      } catch {
        // silent — 401 handled by interceptor (clears token + reload → PairingScreen)
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (createdAt: Date) => {
    const diff = Math.floor((currentTime.getTime() - createdAt.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (createdAt: Date) => {
    const diffMins = (currentTime.getTime() - createdAt.getTime()) / (1000 * 60);
    if (diffMins > 15) return "text-destructive animate-pulse";
    if (diffMins > 8) return "text-amber-500";
    return "text-primary";
  };

  const updateOrderStatus = (id: string, newStatus: "preparing" | "ready") => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    if (newStatus === "ready") {
      toast.success(`Order #${orders.find((o) => o.id === id)?.orderNumber} is Ready!`);
    }
  };

  const toggleItemCompletion = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: o.items.map((it) =>
            it.id === itemId ? { ...it, isCompleted: !it.isCompleted } : it
          ),
        };
      })
    );
  };

  const clearReadyOrders = () => {
    setOrders((prev) => prev.filter((o) => o.status !== "ready"));
    toast.info("Cleared completed orders");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      {/* KDS HEADER */}
      <header className="h-16 flex items-center px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-6">
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
          <PosModeSwitcher currentMode="kds" />
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl ml-8">
          {["Active", "All Tickets", "History"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                tab === "Active" ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-6">
          <div className="flex flex-col items-end leading-none">
            <p className="text-xl font-black font-mono text-white tracking-widest">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <Separator orientation="vertical" className="h-8 bg-slate-800" />
          <Button
            variant="outline"
            size="sm"
            onClick={clearReadyOrders}
            className="border-slate-800 bg-slate-900 text-slate-300 font-black text-[9px] h-10 gap-2 rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR COMPLETED
          </Button>
          <StationQuickSettings station={station} />
        </div>
      </header>

      {/* TICKETS GRID */}
      <ScrollArea className="flex-1 bg-slate-950">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className={`flex flex-col h-[480px] border-2 bg-slate-900 shadow-2xl transition-all ${
                order.status === "ready"
                  ? "border-green-500/30 opacity-60"
                  : order.status === "preparing"
                  ? "border-primary/40"
                  : "border-slate-800"
              }`}
            >
              {/* Ticket Header */}
              <div
                className={`p-4 flex flex-col gap-2 ${
                  order.status === "ready"
                    ? "bg-green-500/10"
                    : order.status === "preparing"
                    ? "bg-primary/5"
                    : "bg-slate-950/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        order.mode === "dine-in"
                          ? "bg-primary/20 text-primary"
                          : "bg-amber-500/20 text-amber-500"
                      }`}
                    >
                      {order.mode === "dine-in" ? (
                        <Utensils className="w-3.5 h-3.5" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-2xl font-black text-white">
                      {order.tableName || `#${order.orderNumber}`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${getTimerColor(order.createdAt)}`}>
                      <Clock className="w-4 h-4" />
                      {getElapsedTime(order.createdAt)}
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{order.mode}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCompletion(order.id, item.id)}
                      className={`group cursor-pointer p-3 rounded-2xl transition-all border ${
                        item.isCompleted
                          ? "bg-slate-950/50 border-slate-900 opacity-30 shadow-none"
                          : "bg-slate-800 hover:bg-slate-700 border-transparent shadow-lg shadow-black/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <span className={`text-xl font-black ${item.isCompleted ? "text-slate-600" : "text-primary"}`}>
                            {item.quantity}x
                          </span>
                          <div>
                            <h4 className={`text-sm font-black uppercase tracking-tight ${item.isCompleted ? "text-slate-500 line-through" : "text-white"}`}>
                              {item.name}
                            </h4>
                            {item.notes && (
                              <div className="mt-1 flex items-center gap-1.5 text-amber-500/80">
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                <p className="text-[10px] font-bold italic leading-tight">{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-950/40 border-t border-slate-800 mt-auto">
                <div className="flex gap-2">
                  {order.status === "pending" ? (
                    <Button
                      className="w-full h-14 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10"
                      onClick={() => updateOrderStatus(order.id, "preparing")}
                    >
                      START PREPARING
                    </Button>
                  ) : order.status === "preparing" ? (
                    <Button
                      className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/10"
                      onClick={() => updateOrderStatus(order.id, "ready")}
                    >
                      MARK AS READY
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 h-14 border-slate-800 text-slate-400 font-bold text-[10px] gap-2 rounded-xl"
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                      >
                        <RotateCcw className="w-4 h-4" />
                        RECALL
                      </Button>
                      <div className="flex items-center justify-center p-3 rounded-xl bg-green-500/20 text-green-500 w-14">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {orders.length === 0 && (
            <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-slate-700">
              <ChefHat className="w-20 h-20 mb-4 opacity-10" />
              <p className="font-black uppercase tracking-[0.3em] text-sm">Kitchen Clear</p>
              <p className="text-[10px] mt-2 italic font-bold">Waiting for new orders from terminal...</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
