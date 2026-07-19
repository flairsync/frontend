import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ─── Resizable panel hook ─────────────────────────────────────────────────────

function useResizablePanel(initial: number, min: number, max: number, invertDelta = false) {
    const [width, setWidth] = useState(initial);
    const widthRef = useRef(width);
    widthRef.current = width;

    const startResize = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const startWidth = widthRef.current;

            const onMove = (ev: MouseEvent | TouchEvent) => {
                const currentX =
                    "touches" in ev
                        ? (ev as TouchEvent).touches[0].clientX
                        : (ev as MouseEvent).clientX;
                const delta = currentX - startX;
                setWidth(Math.min(max, Math.max(min, startWidth + (invertDelta ? -delta : delta))));
            };

            const onUp = () => {
                document.removeEventListener("mousemove", onMove as EventListener);
                document.removeEventListener("mouseup", onUp);
                document.removeEventListener("touchmove", onMove as EventListener);
                document.removeEventListener("touchend", onUp);
            };

            document.addEventListener("mousemove", onMove as EventListener);
            document.addEventListener("mouseup", onUp);
            document.addEventListener("touchmove", onMove as EventListener, { passive: false });
            document.addEventListener("touchend", onUp);
        },
        [min, max, invertDelta],
    );

    return { width, startResize };
}
import { ProductCard } from "@/components/pos/ProductCard";
import { OrderCart } from "@/components/pos/OrderCart";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ConfirmationModal } from "@/components/pos/ConfirmationModal";
import StaffPinScreen from "@/components/pos/StaffPinScreen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search, ClipboardList, Package, LayoutGrid,
    User, MapPin, Utensils, CreditCard, Building2,
    Settings, Lock, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { PosModeSwitcher } from "@/components/pos/PosModeSwitcher";
import { stationApi, staffApi, pinLogout, reorderStationOrderApiCall } from "@/features/station/station-api";
import { normalizePosMenus } from "@/features/station/bootstrap.service";
import StationQuickSettings from "@/components/station/StationQuickSettings";
import { useStaffSession } from "@/features/pos/useStaffSession";
import { useStationSocket } from "@/features/station/useStationSocket";
import {
    enqueueOperation, getAllPending, removeOperations, generateIdempotencyKey,
    type QueuedOperation, type ReconcileResult, type StationOpType,
} from "@/features/station/offlineQueue";
import type { StationInfo } from "@/models/Station";
import type {
    CartItem, PosBootstrapData, PosMenu, PosTable,
    MenuCategory, MenuItem,
} from "@/features/pos/types";
import { calcTotal } from "@/features/pos/types";
import type { Order } from "@/features/orders/service";
import { formatTime } from "@/lib/dateUtils";

const ACTIVE_ORDER_STATUSES = "CREATED,ACCEPTED,PREPARING,READY,SERVED";

// Action → offline queue operation type
const TRANSITION_OP_TYPE: Record<string, StationOpType> = {
    accept: "accept_order",
    prepare: "start_preparing",
    ready: "mark_ready",
    served: "mark_served",
    complete: "complete_order",
    cancel: "cancel_order",
};

// ─── Inactivity lock ──────────────────────────────────────────────────────────

function useInactivityLock(timeoutMs: number, onLock: () => void) {
    useEffect(() => {
        let timer = setTimeout(onLock, timeoutMs);
        const reset = () => {
            clearTimeout(timer);
            timer = setTimeout(onLock, timeoutMs);
        };
        window.addEventListener("pointerdown", reset);
        window.addEventListener("keydown", reset);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("pointerdown", reset);
            window.removeEventListener("keydown", reset);
        };
    }, [timeoutMs, onLock]);
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const TABLE_STATUS_STYLES: Record<string, string> = {
    available: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20",
    occupied: "bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20",
    reserved: "bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20",
    cleaning: "bg-muted border-border text-muted-foreground hover:bg-muted/80",
    out_of_service: "bg-slate-500/10 border-slate-500/30 text-slate-500 hover:bg-slate-500/20",
};

function getTableStatusLabels(t: (key: string) => string): Record<string, string> {
    return {
        available: t("pos_app.table_status.available"),
        occupied: t("pos_app.table_status.occupied"),
        reserved: t("pos_app.table_status.reserved"),
        cleaning: t("pos_app.table_status.cleaning"),
        out_of_service: t("pos_app.table_status.out_of_service"),
    };
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
    station: StationInfo;
    bootstrapData: PosBootstrapData;
}

export default function POSApp({ station, bootstrapData }: Props) {
    const { session, clearSession } = useStaffSession();

    // Call the backend to server-side invalidate the short token, then clear local state.
    const handleLock = useCallback(async () => {
        try { await pinLogout(); } catch { /* always clear locally even if API fails */ }
        clearSession();
    }, [clearSession]);

    useInactivityLock(15 * 60 * 1000, handleLock);

    // Heartbeat
    useEffect(() => {
        const interval = setInterval(async () => {
            try { await stationApi.post("/station/heartbeat"); } catch { /* silent */ }
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

    if (!session) {
        return <StaffPinScreen businessId={station.businessId} onLogin={() => {}} />;
    }

    return <POSMain station={station} bootstrapData={bootstrapData} onLock={handleLock} />;
}

// ─── POSMain ──────────────────────────────────────────────────────────────────

function POSMain({
    station,
    bootstrapData,
    onLock,
}: {
    station: StationInfo;
    bootstrapData: PosBootstrapData;
    onLock: () => void;
}) {
    const { t } = useTranslation("pos");
    const { session } = useStaffSession();
    const perms = session?.posPermissions;

    // ── Resizable panels ──
    const leftPanel = useResizablePanel(192, 140, 300);
    const rightPanel = useResizablePanel(340, 260, 500, true);

    // ── Data state ──
    const [menus, setMenus] = useState<PosMenu[]>(bootstrapData.menus);
    const [tables, setTables] = useState<PosTable[]>(bootstrapData.tables);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);

    // ── UI state ──
    const [activeMainSection, setActiveMainSection] = useState<"menu" | "orders" | "tables">("menu");
    const [orderMode, setOrderMode] = useState<"dine-in" | "takeaway">("dine-in");
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedZoneFloorId, setSelectedZoneFloorId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [creatingOrder, setCreatingOrder] = useState(false);

    // ── Payment modal state ──
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(null);
    const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
    const [payingOrderTotal, setPayingOrderTotal] = useState(0);

    // ── Confirmation modal state ──
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: "default" | "destructive";
    }>({ isOpen: false, title: "", description: "", onConfirm: () => {} });

    // ── Derived menu data ──
    const activeMenus = useMemo(() => menus.filter((m) => m.isActive), [menus]);

    const currentMenu = useMemo(
        () => activeMenus.find((m) => m.id === selectedMenuId) ?? activeMenus[0] ?? null,
        [activeMenus, selectedMenuId],
    );

    const categories: MenuCategory[] = useMemo(
        () => currentMenu?.categories ?? [],
        [currentMenu],
    );

    const currentCategory: MenuCategory | null = useMemo(
        () => categories.find((c) => c.id === selectedCategoryId) ?? categories[0] ?? null,
        [categories, selectedCategoryId],
    );

    const displayItems: MenuItem[] = useMemo(() => {
        if (!currentCategory) return [];
        const q = searchQuery.toLowerCase();
        return q
            ? currentCategory.items.filter((i) => i.name.toLowerCase().includes(q))
            : currentCategory.items;
    }, [currentCategory, searchQuery]);

    // ── Derived floor data ──
    const floors = useMemo(() => {
        const map = new Map<string, string>();
        tables.forEach((t) => {
            if (!map.has(t.floorId)) map.set(t.floorId, t.floorName ?? `Floor ${map.size + 1}`);
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [tables]);

    const filteredTables = useMemo(
        () =>
            selectedZoneFloorId
                ? tables.filter((t) => t.floorId === selectedZoneFloorId)
                : tables,
        [tables, selectedZoneFloorId],
    );

    const selectedTable = useMemo(
        () => tables.find((t) => t.id === selectedTableId),
        [tables, selectedTableId],
    );

    const cartTotal = useMemo(() => calcTotal(cart), [cart]);

    // ── Data fetching ──
    const [orderPage, setOrderPage] = useState(1);
    const ORDER_PAGE_LIMIT = 20;

    const refreshOrders = useCallback(async (page = 1) => {
        try {
            const res = await stationApi.get("/station/orders", {
                params: { status: "created,accepted,preparing,ready", page, limit: ORDER_PAGE_LIMIT },
            });
            const raw = res.data?.data?.data ?? res.data?.data ?? [];
            if (page === 1) {
                setActiveOrders(Array.isArray(raw) ? raw : []);
            } else {
                setActiveOrders((prev) => [
                    ...prev,
                    ...(Array.isArray(raw) ? raw.filter((o: Order) => !prev.some((p) => p.id === o.id)) : []),
                ]);
            }
            setOrderPage(page);
        } catch { /* silent */ }
    }, []);

    const refreshTables = useCallback(async () => {
        try {
            const res = await stationApi.get("/station/tables");
            const raw = res.data?.data ?? [];
            if (Array.isArray(raw)) setTables(raw);
        } catch { /* silent */ }
    }, []);

    // Menu items are otherwise only fetched once at station bootstrap, so
    // server-side changes (auto-disable on out-of-stock, manual edits) never
    // reach an already-open POS session without this.
    const refreshMenus = useCallback(async () => {
        try {
            const res = await stationApi.get("/station/menu");
            const raw: any[] = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
            setMenus(normalizePosMenus(raw));
        } catch { /* silent */ }
    }, []);

    // Initial load + 60s fallback poll (WebSocket handles real-time updates)
    useEffect(() => {
        refreshOrders(1);
        const ordersInterval = setInterval(() => refreshOrders(1), 60_000);
        const tablesInterval = setInterval(refreshTables, 15_000);
        const menusInterval = setInterval(refreshMenus, 30_000);
        return () => {
            clearInterval(ordersInterval);
            clearInterval(tablesInterval);
            clearInterval(menusInterval);
        };
    }, [refreshOrders, refreshTables, refreshMenus]);

    // Real-time order updates via WebSocket
    useStationSocket(useCallback(() => {
        refreshOrders();
        refreshTables();
        refreshMenus();
    }, [refreshOrders, refreshTables, refreshMenus]));

    // Replay queued offline operations on reconnect
    useEffect(() => {
        const handleOnline = async () => {
            const pending = await getAllPending();
            if (!pending.length) return;

            try {
                const res = await staffApi.post("/station/reconcile", { operations: pending });
                const results: ReconcileResult[] = res.data?.data ?? res.data ?? [];

                const clearKeys = results
                    .filter((r) => r.status === "applied" || r.status === "already_applied")
                    .map((r) => r.idempotencyKey);
                await removeOperations(clearKeys);

                const issues = results.filter(
                    (r) => r.status === "conflict" || r.status === "error",
                );
                if (issues.length > 0) {
                    toast.warning(
                        t("pos_app.toasts.offline_sync_issues", { count: issues.length }),
                    );
                } else if (clearKeys.length > 0) {
                    toast.success(t("pos_app.toasts.offline_sync_success", { count: clearKeys.length }));
                }
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    toast.error(t("pos_app.toasts.session_expired_offline_sync"));
                }
            } finally {
                await Promise.all([refreshOrders(), refreshTables()]);
            }
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [refreshOrders, refreshTables]);

    // ── Kitchen notes & tax-exempt ──
    const [kitchenNotes, setKitchenNotes] = useState("");
    const [taxExempt, setTaxExempt] = useState(false);

    // ── Cart helpers ──
    const addToCart = useCallback((item: MenuItem) => {
        const cartId = item.id;
        setCart((prev) => {
            const existing = prev.find((c) => c.id === cartId);
            if (existing) {
                return prev.map((c) =>
                    c.id === cartId ? { ...c, quantity: c.quantity + 1 } : c,
                );
            }
            return [
                ...prev,
                {
                    id: cartId,
                    name: item.name,
                    price: item.basePrice,
                    quantity: 1,
                    modifierNames: [],
                    menuItemId: item.id,
                    modifiers: [],
                },
            ];
        });
    }, []);

    // Mirrors the old cart.find(...)?.quantity semantics (first match wins),
    // just precomputed once per cart change instead of once per rendered card.
    const cartQuantityByMenuItemId = useMemo(() => {
        const map = new Map<string, number>();
        for (const c of cart) {
            if (!map.has(c.menuItemId)) map.set(c.menuItemId, c.quantity);
        }
        return map;
    }, [cart]);

    const resetActiveOrder = () => {
        setCart([]);
        setSelectedTableId(null);
        setOrderMode("dine-in");
        setKitchenNotes("");
        setTaxExempt(false);
    };

    // ── Order creation ──
    const buildOrderPayload = () => ({
        type: orderMode === "dine-in" ? "dine_in" : "takeaway",
        tableId: orderMode === "dine-in" ? selectedTableId ?? undefined : undefined,
        items: cart.map((ci) => ({
            menuItemId: ci.menuItemId,
            variantId: ci.variantId,
            quantity: ci.quantity,
            modifiers: ci.modifiers,
            notes: ci.notes,
        })),
        kitchenNotes: kitchenNotes.trim() || undefined,
        taxExempt: taxExempt || undefined,
    });

    // Throws an error with `queued: true` when offline so the caller can distinguish.
    const createAndAcceptOrder = async () => {
        const orderPayload = buildOrderPayload();

        if (!navigator.onLine) {
            const createKey = generateIdempotencyKey();
            await enqueueOperation({
                idempotencyKey: createKey,
                type: "create_order",
                payload: orderPayload,
                clientTimestamp: new Date().toISOString(),
            });
            const offlineErr = Object.assign(new Error("offline"), { queued: true });
            throw offlineErr;
        }

        const createKey = generateIdempotencyKey();
        const res = await staffApi.post("/station/orders", orderPayload, {
            headers: { "X-Idempotency-Key": createKey },
        });
        const order: Order = res.data.data;

        try {
            const acceptKey = generateIdempotencyKey();
            await staffApi.patch(`/station/orders/${order.id}/accept`, {}, {
                headers: { "X-Idempotency-Key": acceptKey },
            });
        } catch { /* accept failure is non-fatal */ }

        return order;
    };

    const handleConfirmOrder = async () => {
        if (cart.length === 0) return;
        if (orderMode === "dine-in" && !selectedTableId) {
            toast.error(t("pos_app.toasts.select_table_to_continue"));
            setActiveMainSection("tables");
            return;
        }
        setCreatingOrder(true);
        try {
            await createAndAcceptOrder();
            resetActiveOrder();
            toast.success(t("pos_app.toasts.order_sent_to_kitchen"));
            await Promise.all([refreshOrders(), refreshTables()]);
        } catch (err: any) {
            if (err.queued) {
                resetActiveOrder();
                toast.info(t("pos_app.toasts.offline_order_queued"));
            } else {
                toast.error(err?.response?.data?.message ?? t("pos_app.toasts.create_order_failed"));
            }
        } finally {
            setCreatingOrder(false);
        }
    };

    const handlePayment = async (
        method: "cash" | "card",
        existingOrderId?: string,
        existingTotal?: number,
    ) => {
        if (existingOrderId) {
            setPayingOrderId(existingOrderId);
            setPayingOrderTotal(existingTotal ?? 0);
            setPaymentMethod(method);
            setIsPaymentModalOpen(true);
            return;
        }

        if (!navigator.onLine) {
            toast.error(t("pos_app.toasts.payment_requires_connection"));
            return;
        }

        if (cart.length === 0) return;
        if (orderMode === "dine-in" && !selectedTableId) {
            toast.error(t("pos_app.toasts.select_table_dine_in"));
            setActiveMainSection("tables");
            return;
        }
        setCreatingOrder(true);
        try {
            const order = await createAndAcceptOrder();
            setPayingOrderId(order.id);
            setPayingOrderTotal(Number(order.totalAmount) || cartTotal);
            setPaymentMethod(method);
            setIsPaymentModalOpen(true);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? t("pos_app.toasts.create_order_failed"));
        } finally {
            setCreatingOrder(false);
        }
    };

    const finalizeOrder = () => {
        setIsPaymentModalOpen(false);
        setPayingOrderId(null);
        setPayingOrderTotal(0);
        resetActiveOrder();
        Promise.all([refreshOrders(), refreshTables()]);
    };

    // ── Order transition helpers ──
    const handleTransition = useCallback(
        async (orderId: string, action: string) => {
            if (!navigator.onLine) {
                const opType = TRANSITION_OP_TYPE[action] ?? "accept_order";
                await enqueueOperation({
                    idempotencyKey: generateIdempotencyKey(),
                    type: opType,
                    orderId,
                    clientTimestamp: new Date().toISOString(),
                });
                toast.info(t("pos_app.toasts.offline_action_queued"));
                return;
            }
            try {
                await staffApi.patch(`/station/orders/${orderId}/${action}`, {}, {
                    headers: { "X-Idempotency-Key": generateIdempotencyKey() },
                });
                refreshOrders();
                refreshTables();
            } catch (err: any) {
                toast.error(err?.response?.data?.message ?? t("pos_app.toasts.update_order_failed"));
            }
        },
        [refreshOrders, refreshTables, t],
    );

    const handleCancelOrder = useCallback(
        (orderId: string) => {
            setConfirmModal({
                isOpen: true,
                title: t("pos_app.confirm_modals.cancel_order.title"),
                description: t("pos_app.confirm_modals.cancel_order.description"),
                variant: "destructive",
                onConfirm: async () => {
                    if (!navigator.onLine) {
                        await enqueueOperation({
                            idempotencyKey: generateIdempotencyKey(),
                            type: "cancel_order",
                            orderId,
                            clientTimestamp: new Date().toISOString(),
                        });
                        toast.info(t("pos_app.toasts.offline_cancel_queued"));
                        return;
                    }
                    try {
                        await staffApi.patch(`/station/orders/${orderId}/cancel`, {}, {
                            headers: { "X-Idempotency-Key": generateIdempotencyKey() },
                        });
                        toast.success(t("pos_app.toasts.order_cancelled"));
                        refreshOrders();
                        refreshTables();
                    } catch (err: any) {
                        toast.error(err?.response?.data?.message ?? t("pos_app.toasts.cancel_order_failed"));
                    }
                },
            });
        },
        [refreshOrders, refreshTables, t],
    );

    const handleMarkTableClean = useCallback(async (table: PosTable) => {
        try {
            await stationApi.patch(`/station/tables/${table.id}/status`, { status: "available" });
            toast.success(t("pos_app.toasts.table_marked_clean", { name: table.name }));
            refreshTables();
        } catch {
            toast.error(t("pos_app.toasts.table_mark_clean_failed"));
        }
    }, [refreshTables, t]);

    const handleTableSelect = (table: PosTable) => {
        if (table.status === "occupied") {
            const existing = activeOrders.find((o) => o.tableId === table.id);
            if (existing) {
                setConfirmModal({
                    isOpen: true,
                    title: t("pos_app.confirm_modals.table_occupied.title", { name: table.name }),
                    description: t("pos_app.confirm_modals.table_occupied.description", { amount: Number(existing.totalAmount).toFixed(2) }),
                    onConfirm: () => {
                        setActiveMainSection("orders");
                    },
                });
                return;
            }
        }
        if (table.status === "cleaning") {
            setConfirmModal({
                isOpen: true,
                title: t("pos_app.confirm_modals.table_cleaning.title", { name: table.name }),
                description: t("pos_app.confirm_modals.table_cleaning.description"),
                onConfirm: () => handleMarkTableClean(table),
            });
            return;
        }
        if (table.status === "out_of_service") return;
        setSelectedTableId(table.id);
        setOrderMode("dine-in");
        setActiveMainSection("menu");
        toast.info(t("pos_app.toasts.table_assigned_to_cart", { name: table.name }));
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: t("pos_app.confirm_modals.clear_cart.title"),
            description: t("pos_app.confirm_modals.clear_cart.description"),
            variant: "destructive",
            onConfirm: resetActiveOrder,
        });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background text-foreground antialiased">
            {/* TOP NAV */}
            <nav className="h-16 flex items-center px-6 bg-card border-b border-border flex-shrink-0 z-20">
                <div className="flex items-center gap-6 mr-12">
                    <PosModeSwitcher currentMode="terminal" />
                </div>

                <div className="flex bg-muted/50 p-1 rounded-xl">
                    {[
                        { id: "menu", label: t("pos_app.nav.menu"), icon: <Package className="w-4 h-4" /> },
                        {
                            id: "orders",
                            label: t("pos_app.nav.orders"),
                            icon: <ClipboardList className="w-4 h-4" />,
                        },
                        {
                            id: "tables",
                            label: t("pos_app.nav.tables"),
                            icon: <LayoutGrid className="w-4 h-4" />,
                            hidden: !station.business.allowTableOrdering,
                        },
                    ]
                        .filter((tab) => !tab.hidden)
                        .map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveMainSection(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-[10px] tracking-widest transition-all ${
                                    activeMainSection === tab.id
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.id === "orders" && activeOrders.length > 0 && (
                                    <span className="ml-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center">
                                        {activeOrders.length}
                                    </span>
                                )}
                            </button>
                        ))}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-full border border-border">
                        <div className="text-right flex flex-col leading-none">
                            <p className="text-[10px] font-black text-foreground">
                                {session?.name ?? station.name}
                            </p>
                            <p className="text-[8px] text-primary font-bold flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5" />
                                {station.business.name}
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <User className="w-4 h-4" />
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLock}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        title={t("pos_app.titles.lock_terminal")}
                    >
                        <Lock className="w-4 h-4" />
                    </Button>

                    <StationQuickSettings station={station} />
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside
                    style={{ width: leftPanel.width }}
                    className="bg-card flex flex-col py-4 flex-shrink-0 overflow-hidden"
                >
                    <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase px-4 mb-3">
                        {activeMainSection === "menu"
                            ? t("pos_app.sidebar.category")
                            : activeMainSection === "tables"
                            ? t("pos_app.sidebar.floor")
                            : t("pos_app.sidebar.filter")}
                    </p>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-1 px-2">
                            {/* Menu section: multi-menu switcher + categories */}
                            {activeMainSection === "menu" && (
                                <>
                                    {activeMenus.length > 1 && (
                                        <div className="mb-2 px-1">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">
                                                {t("pos_app.sidebar.menu")}
                                            </p>
                                            {activeMenus.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setSelectedMenuId(m.id);
                                                        setSelectedCategoryId(null);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                        currentMenu?.id === m.id
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground hover:bg-muted"
                                                    }`}
                                                >
                                                    {m.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategoryId(cat.id)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                                                currentCategory?.id === cat.id
                                                    ? "bg-primary text-primary-foreground shadow-lg"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            <Package className="w-4 h-4 flex-shrink-0" />
                                            {cat.name}
                                        </button>
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="text-[10px] text-muted-foreground px-3 italic">
                                            {t("pos_app.sidebar.no_categories")}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Tables section: floor filter */}
                            {activeMainSection === "tables" && (
                                <>
                                    <button
                                        onClick={() => setSelectedZoneFloorId(null)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                                            !selectedZoneFloorId
                                                ? "bg-primary text-primary-foreground shadow-lg"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                                        {t("pos_app.sidebar.all_floors")}
                                    </button>
                                    {floors.map((floor) => (
                                        <button
                                            key={floor.id}
                                            onClick={() => setSelectedZoneFloorId(floor.id)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                                                selectedZoneFloorId === floor.id
                                                    ? "bg-primary text-primary-foreground shadow-lg"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            {floor.name}
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* Orders section: filters */}
                            {activeMainSection === "orders" && (
                                <>
                                    {[
                                        t("pos_app.order_filters.all_active"),
                                        t("pos_app.order_filters.created"),
                                        t("pos_app.order_filters.preparing"),
                                        t("pos_app.order_filters.ready"),
                                    ].map((f) => (
                                        <button
                                            key={f}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                        >
                                            <ClipboardList className="w-4 h-4 flex-shrink-0" />
                                            {f}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Left resize handle */}
                <div
                    onMouseDown={leftPanel.startResize}
                    onTouchStart={leftPanel.startResize}
                    style={{ touchAction: "none" }}
                    className="w-1 flex-shrink-0 cursor-col-resize bg-border hover:bg-primary/50 active:bg-primary transition-colors select-none"
                    title={t("pos_app.titles.drag_to_resize")}
                />

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                    {/* ── MENU VIEW ── */}
                    {activeMainSection === "menu" && (
                        <>
                            <div className="h-14 flex items-center px-6 gap-4 border-b border-border bg-card/30 flex-shrink-0">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t("pos_app.menu_view.search_placeholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none focus-visible:ring-0 text-xs p-0 h-auto placeholder:text-muted-foreground/50 font-medium"
                                />
                            </div>
                            <ScrollArea className="flex-1">
                                {displayItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                        <Package className="w-12 h-12 mb-3 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">
                                            {categories.length === 0
                                                ? t("pos_app.menu_view.no_menu_configured")
                                                : t("pos_app.menu_view.no_items_in_category")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {displayItems.map((item) => (
                                            <ProductCard
                                                key={item.id}
                                                product={item}
                                                onClick={addToCart}
                                                quantity={cartQuantityByMenuItemId.get(item.id)}
                                                currency={station.business.currency}
                                            />
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </>
                    )}

                    {/* ── ORDERS VIEW ── */}
                    {activeMainSection === "orders" && (
                        <div className="h-full p-8 overflow-auto">
                            <div className="flex items-end gap-3 mb-8">
                                <h2 className="text-2xl font-black tracking-tight">
                                    {t("pos_app.orders_view.active_orders")}
                                </h2>
                                <span className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-widest">
                                    {t("pos_app.orders_view.total_count", { count: activeOrders.length })}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 ml-1 mb-0.5"
                                    onClick={() => refreshOrders(1)}
                                    title={t("pos_app.titles.refresh_orders")}
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeOrders.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border">
                                        <ClipboardList className="w-12 h-12 mb-4 opacity-10" />
                                        <p className="font-bold uppercase tracking-widest text-xs">
                                            {t("pos_app.orders_view.no_active_orders")}
                                        </p>
                                    </div>
                                )}
                                {activeOrders.map((order) => (
                                    <ActiveOrderCard
                                        key={order.id}
                                        order={order}
                                        posPermissions={perms}
                                        onPay={(method) =>
                                            handlePayment(
                                                method,
                                                order.id,
                                                Number(order.totalAmount),
                                            )
                                        }
                                        onTransition={(action) => handleTransition(order.id, action)}
                                        onCancel={() => handleCancelOrder(order.id)}
                                        onReorder={async () => {
                                            try {
                                                const res = await reorderStationOrderApiCall(order.id);
                                                toast.success(t("pos_app.toasts.reorder_created"));
                                                await refreshOrders(1);
                                                const newOrder: Order = res.data?.data ?? res.data;
                                                if (newOrder?.id) {
                                                    setPayingOrderId(newOrder.id);
                                                    setPayingOrderTotal(Number(newOrder.totalAmount) || 0);
                                                }
                                            } catch {
                                                toast.error(t("pos_app.toasts.reorder_failed"));
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            {activeOrders.length >= ORDER_PAGE_LIMIT && (
                                <div className="flex justify-center mt-6">
                                    <Button
                                        variant="outline"
                                        className="font-black text-xs uppercase tracking-widest"
                                        onClick={() => refreshOrders(orderPage + 1)}
                                    >
                                        {t("pos_app.orders_view.load_more")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TABLES VIEW ── */}
                    {activeMainSection === "tables" && (
                        <div className="h-full p-8 overflow-auto">
                            <div className="flex items-center gap-3 mb-8">
                                <h2 className="text-2xl font-black tracking-tight">
                                    {t("pos_app.tables_view.select_a_table")}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={refreshTables}
                                    title={t("pos_app.titles.refresh_tables")}
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {filteredTables.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <LayoutGrid className="w-12 h-12 mb-3 opacity-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest">
                                        {t("pos_app.tables_view.no_tables_configured")}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {filteredTables.map((table) => {
                                        const isActive = selectedTableId === table.id;
                                        const statusStyle =
                                            TABLE_STATUS_STYLES[table.status] ??
                                            TABLE_STATUS_STYLES.AVAILABLE;
                                        const tableStatusLabels = getTableStatusLabels(t);
                                        return (
                                            <div
                                                key={table.id}
                                                onClick={() => handleTableSelect(table)}
                                                className={`relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 border-2 transition-all cursor-pointer ${
                                                    isActive
                                                        ? "bg-primary border-primary text-primary-foreground shadow-2xl scale-110 z-10"
                                                        : statusStyle
                                                }`}
                                            >
                                                <div
                                                    className={`p-3 rounded-2xl ${isActive ? "bg-black/10" : "bg-background/30"}`}
                                                >
                                                    <LayoutGrid
                                                        className={`w-8 h-8 ${isActive ? "opacity-100" : "opacity-50"}`}
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <span className="font-black text-sm block">
                                                        {table.name}
                                                    </span>
                                                    <span
                                                        className={`text-[9px] font-black uppercase tracking-tighter ${
                                                            isActive
                                                                ? "text-primary-foreground/70"
                                                                : "opacity-70"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? t("pos_app.tables_view.current")
                                                            : tableStatusLabels[table.status] ??
                                                              table.status}
                                                    </span>
                                                </div>
                                                {table.status === "occupied" && !isActive && (
                                                    <Badge className="absolute -top-2 -right-2 px-1.5 h-5 font-black text-[9px] bg-red-500">
                                                        {t("pos_app.tables_view.active_badge")}
                                                    </Badge>
                                                )}
                                                {table.status === "cleaning" && !isActive && (
                                                    <Badge className="absolute -top-2 -right-2 px-1.5 h-5 font-black text-[9px] bg-slate-500">
                                                        {t("pos_app.table_status.cleaning")}
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Right resize handle */}
                <div
                    onMouseDown={rightPanel.startResize}
                    onTouchStart={rightPanel.startResize}
                    style={{ touchAction: "none" }}
                    className="w-1 flex-shrink-0 cursor-col-resize bg-border hover:bg-primary/50 active:bg-primary transition-colors select-none"
                    title={t("pos_app.titles.drag_to_resize")}
                />

                {/* RIGHT CART SIDEBAR */}
                <aside
                    style={{ width: rightPanel.width }}
                    className="flex flex-col h-full flex-shrink-0 bg-card/20 overflow-hidden"
                >
                    <OrderCart
                        items={cart}
                        orderMode={orderMode}
                        selectedTable={selectedTable?.name}
                        staffName={session?.name}
                        currency={station.business.currency}
                        kitchenNotes={kitchenNotes}
                        taxExempt={taxExempt}
                        canCreateOrder={perms?.posCreateOrder ?? false}
                        canApplyDiscount={perms?.posApplyDiscount ?? false}
                        onUpdateQuantity={(id, delta) =>
                            setCart((prev) =>
                                prev.map((item) =>
                                    item.id === id
                                        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                                        : item,
                                ),
                            )
                        }
                        onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
                        onClear={handleClearCart}
                        onPayment={(method) => handlePayment(method)}
                        onConfirm={handleConfirmOrder}
                        onChangeMode={setOrderMode}
                        onChangeTable={() => setActiveMainSection("tables")}
                        onKitchenNotesChange={setKitchenNotes}
                        onTaxExemptChange={setTaxExempt}
                    />
                </aside>
            </div>

            {/* Payment modal — station mode: uses station API, hides mgmt-only features */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={finalizeOrder}
                total={payingOrderTotal || cartTotal}
                method={paymentMethod}
                orderId={payingOrderId ?? undefined}
                stationMode
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                variant={confirmModal.variant}
            />
        </div>
    );
}

// ─── Active Order Card ────────────────────────────────────────────────────────

function getStatusTransition(t: (key: string) => string): Record<string, { label: string; action: string }> {
    return {
        CREATED: { label: t("pos_app.order_card.transition.accept"), action: "accept" },
        ACCEPTED: { label: t("pos_app.order_card.transition.preparing"), action: "prepare" },
        PREPARING: { label: t("pos_app.order_card.transition.mark_ready"), action: "ready" },
        READY: { label: t("pos_app.order_card.transition.mark_served"), action: "served" },
    };
}

function getOrderStatusLabels(t: (key: string) => string): Record<string, string> {
    return {
        CREATED: t("pos_app.order_card.status.created"),
        ACCEPTED: t("pos_app.order_card.status.accepted"),
        PREPARING: t("pos_app.order_card.status.preparing"),
        READY: t("pos_app.order_card.status.ready"),
        SERVED: t("pos_app.order_card.status.served"),
    };
}

const STATUS_COLOR: Record<string, string> = {
    CREATED: "bg-yellow-500/10 text-yellow-600",
    ACCEPTED: "bg-blue-500/10 text-blue-600",
    PREPARING: "bg-orange-500/10 text-orange-600",
    READY: "bg-emerald-500/10 text-emerald-600",
    SERVED: "bg-teal-500/10 text-teal-600",
};

function ActiveOrderCard({
    order,
    posPermissions,
    onPay,
    onTransition,
    onCancel,
    onReorder,
}: {
    order: Order;
    posPermissions?: { posCreateOrder: boolean; posVoidItem: boolean; posCancelOrder: boolean; posRefund: boolean; posApplyDiscount: boolean } | null;
    onPay: (method: "cash" | "card") => void;
    onTransition: (action: string) => void;
    onCancel: () => void;
    onReorder?: () => void;
}) {
    const { t } = useTranslation("pos");
    const time = formatTime(order.createdAt);
    const statusUpper = order.status.toUpperCase();
    const transition = getStatusTransition(t)[statusUpper];
    const canPay = ["ACCEPTED", "PREPARING", "READY", "SERVED"].includes(statusUpper);

    return (
        <Card className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all">
            <CardContent className="p-0">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div
                                className={`p-1.5 rounded-lg ${
                                    order.type === "dine_in"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-amber-500/10 text-amber-500"
                                }`}
                            >
                                {order.type === "dine_in" ? (
                                    <Utensils className="w-4 h-4" />
                                ) : (
                                    <Package className="w-4 h-4" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-sm">
                                    {order.table?.name ?? (order.type === "dine_in" ? t("pos_app.order_card.table") : t("pos_app.order_card.takeaway"))}
                                </h3>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${STATUS_COLOR[statusUpper] ?? "bg-muted text-muted-foreground"}`}>
                                    {getOrderStatusLabels(t)[statusUpper] ?? order.status}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {time}
                        </span>
                    </div>

                    <div className="space-y-1 mb-5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                            {t("pos_app.order_card.total", { amount: Number(order.totalAmount).toFixed(2) })}
                        </p>
                        {order.items.slice(0, 2).map((it, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                                {it.quantity}× {it.nameSnapshot ?? t("pos_app.order_card.unnamed_item")}
                            </p>
                        ))}
                        {order.items.length > 2 && (
                            <p className="text-[10px] text-muted-foreground font-bold">
                                {t("pos_app.order_card.more_items", { count: order.items.length - 2 })}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {transition && posPermissions?.posCreateOrder && (
                            <Button
                                variant="outline"
                                className="w-full font-black text-[10px] h-9 gap-2"
                                onClick={() => onTransition(transition.action)}
                            >
                                {transition.label}
                            </Button>
                        )}

                        {canPay && posPermissions?.posRefund && (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    className="font-black text-[10px] h-10 gap-2"
                                    onClick={() => onPay("card")}
                                >
                                    <CreditCard className="w-3 h-3" />
                                    {t("pos_app.order_card.pay_card")}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="font-black text-[10px] h-10 gap-2"
                                    onClick={() => onPay("cash")}
                                >
                                    <Settings className="w-3 h-3" />
                                    {t("pos_app.order_card.pay_cash")}
                                </Button>
                            </div>
                        )}

                        {onReorder && posPermissions?.posCreateOrder && (
                            <Button
                                variant="ghost"
                                className="w-full font-bold text-[9px] h-8 uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10"
                                onClick={onReorder}
                            >
                                {t("pos_app.order_card.reorder")}
                            </Button>
                        )}
                        {posPermissions?.posCancelOrder && (
                            <Button
                                variant="ghost"
                                className="col-span-2 text-destructive/40 hover:text-destructive hover:bg-destructive/10 font-bold text-[9px] h-8 uppercase tracking-widest"
                                onClick={onCancel}
                            >
                                {t("pos_app.order_card.cancel_and_void")}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
