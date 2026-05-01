import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { PosModeSwitcher } from "@/components/pos/PosModeSwitcher";
import { stationApi, staffApi } from "@/features/station/station-api";
import StationQuickSettings from "@/components/station/StationQuickSettings";
import { useStaffSession } from "@/features/pos/useStaffSession";
import type { StationInfo } from "@/models/Station";
import type {
    CartItem, PosBootstrapData, PosMenu, PosTable,
    MenuCategory, MenuItem,
} from "@/features/pos/types";
import { calcSubtotal, calcTax, calcTotal } from "@/features/pos/types";
import type { Order } from "@/features/orders/service";

const ACTIVE_ORDER_STATUSES = "CREATED,ACCEPTED,PREPARING,READY";

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
    AVAILABLE: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20",
    OCCUPIED: "bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20",
    RESERVED: "bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20",
    CLEANING: "bg-muted border-border text-muted-foreground hover:bg-muted/80",
};

const TABLE_STATUS_LABELS: Record<string, string> = {
    AVAILABLE: "Vacant",
    OCCUPIED: "Occupied",
    RESERVED: "Reserved",
    CLEANING: "Cleaning",
};

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
    station: StationInfo;
    bootstrapData: PosBootstrapData;
}

export default function POSApp({ station, bootstrapData }: Props) {
    const { session, clearSession } = useStaffSession();

    useInactivityLock(15 * 60 * 1000, clearSession);

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

    return <POSMain station={station} bootstrapData={bootstrapData} onLock={clearSession} />;
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
    const { session } = useStaffSession();

    // ── Data state ──
    const [menus] = useState<PosMenu[]>(bootstrapData.menus);
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

    // ── Polling ──
    const refreshOrders = useCallback(async () => {
        try {
            const res = await stationApi.get("/station/orders", {
                params: { status: ACTIVE_ORDER_STATUSES, limit: 100 },
            });
            const raw = res.data?.data?.data ?? res.data?.data ?? [];
            setActiveOrders(
                Array.isArray(raw)
                    ? raw.filter((o: Order) =>
                          ["CREATED", "ACCEPTED", "PREPARING", "READY"].includes(
                              o.status.toUpperCase(),
                          ),
                      )
                    : [],
            );
        } catch { /* silent */ }
    }, []);

    const refreshTables = useCallback(async () => {
        try {
            const res = await stationApi.get("/station/tables");
            const raw = res.data?.data ?? [];
            if (Array.isArray(raw)) setTables(raw);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        refreshOrders();
        const ordersInterval = setInterval(refreshOrders, 10_000);
        const tablesInterval = setInterval(refreshTables, 15_000);
        return () => {
            clearInterval(ordersInterval);
            clearInterval(tablesInterval);
        };
    }, [refreshOrders, refreshTables]);

    // ── Cart helpers ──
    const addToCart = (item: MenuItem) => {
        // For items with required variants, we'd open a modal — for now add with base price
        const cartId = item.id; // single-variant simplification; extend with variant suffix later
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
    };

    const resetActiveOrder = () => {
        setCart([]);
        setSelectedTableId(null);
        setOrderMode("dine-in");
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
    });

    const createAndAcceptOrder = async () => {
        const res = await staffApi.post(
            `/businesses/${station.businessId}/orders`,
            buildOrderPayload(),
        );
        const order: Order = res.data.data;
        // Auto-accept (single-cashier flow)
        try {
            await staffApi.patch(`/businesses/${station.businessId}/orders/${order.id}/accept`);
        } catch { /* accept failure is non-fatal */ }
        return order;
    };

    const handleConfirmOrder = async () => {
        if (cart.length === 0) return;
        if (orderMode === "dine-in" && !selectedTableId) {
            toast.error("Please select a table to continue");
            setActiveMainSection("tables");
            return;
        }
        setCreatingOrder(true);
        try {
            await createAndAcceptOrder();
            resetActiveOrder();
            toast.success("Order sent to kitchen!");
            await Promise.all([refreshOrders(), refreshTables()]);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to create order";
            toast.error(msg);
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
            // Pay an already-created order
            setPayingOrderId(existingOrderId);
            setPayingOrderTotal(existingTotal ?? 0);
            setPaymentMethod(method);
            setIsPaymentModalOpen(true);
            return;
        }

        // Cart payment — create order first, then open modal
        if (cart.length === 0) return;
        if (orderMode === "dine-in" && !selectedTableId) {
            toast.error("Please select a table for Dine-In orders");
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
            const msg = err?.response?.data?.message ?? "Failed to create order";
            toast.error(msg);
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

    const handleTableSelect = (table: PosTable) => {
        if (table.status === "OCCUPIED") {
            const existing = activeOrders.find((o) => o.tableId === table.id);
            if (existing) {
                setConfirmModal({
                    isOpen: true,
                    title: `${table.name} is Occupied`,
                    description: `This table has an active order ($${Number(existing.totalAmount).toFixed(2)}). Would you like to view it?`,
                    onConfirm: () => {
                        setActiveMainSection("orders");
                    },
                });
                return;
            }
        }
        setSelectedTableId(table.id);
        setOrderMode("dine-in");
        setActiveMainSection("menu");
        toast.info(`${table.name} assigned to cart`);
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: "Clear Active Order?",
            description: "This will remove all items from the current cart.",
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
                        { id: "menu", label: "MENU", icon: <Package className="w-4 h-4" /> },
                        {
                            id: "orders",
                            label: "ORDERS",
                            icon: <ClipboardList className="w-4 h-4" />,
                        },
                        {
                            id: "tables",
                            label: "TABLES",
                            icon: <LayoutGrid className="w-4 h-4" />,
                            hidden: !station.business.allowTableOrdering,
                        },
                    ]
                        .filter((t) => !t.hidden)
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
                        title="Lock terminal"
                    >
                        <Lock className="w-4 h-4" />
                    </Button>

                    <StationQuickSettings station={station} />
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside className="w-48 bg-card border-r border-border flex flex-col py-4 flex-shrink-0">
                    <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase px-4 mb-3">
                        {activeMainSection === "menu"
                            ? "Category"
                            : activeMainSection === "tables"
                            ? "Floor"
                            : "Filter"}
                    </p>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-1 px-2">
                            {/* Menu section: multi-menu switcher + categories */}
                            {activeMainSection === "menu" && (
                                <>
                                    {activeMenus.length > 1 && (
                                        <div className="mb-2 px-1">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">
                                                Menu
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
                                            No categories
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
                                        All Floors
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
                                    {["All Active", "Created", "Preparing", "Ready"].map((f) => (
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

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                    {/* ── MENU VIEW ── */}
                    {activeMainSection === "menu" && (
                        <>
                            <div className="h-14 flex items-center px-6 gap-4 border-b border-border bg-card/30 flex-shrink-0">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search menu items..."
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
                                                ? "No menu configured"
                                                : "No items in this category"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {displayItems.map((item) => (
                                            <ProductCard
                                                key={item.id}
                                                product={item}
                                                onClick={addToCart}
                                                quantity={
                                                    cart.find((c) => c.menuItemId === item.id)
                                                        ?.quantity
                                                }
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
                                    Active Orders
                                </h2>
                                <span className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-widest">
                                    {activeOrders.length} Total
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 ml-1 mb-0.5"
                                    onClick={refreshOrders}
                                    title="Refresh orders"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeOrders.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border">
                                        <ClipboardList className="w-12 h-12 mb-4 opacity-10" />
                                        <p className="font-bold uppercase tracking-widest text-xs">
                                            No active orders
                                        </p>
                                    </div>
                                )}
                                {activeOrders.map((order) => (
                                    <ActiveOrderCard
                                        key={order.id}
                                        order={order}
                                        onPay={(method) =>
                                            handlePayment(
                                                method,
                                                order.id,
                                                Number(order.totalAmount),
                                            )
                                        }
                                        onCancel={() =>
                                            setConfirmModal({
                                                isOpen: true,
                                                title: "Cancel Order?",
                                                description:
                                                    "Are you sure you want to cancel this order?",
                                                variant: "destructive",
                                                onConfirm: async () => {
                                                    try {
                                                        await staffApi.patch(
                                                            `/businesses/${station.businessId}/orders/${order.id}/cancel`,
                                                            {},
                                                        );
                                                        toast.success("Order cancelled");
                                                        refreshOrders();
                                                        refreshTables();
                                                    } catch {
                                                        toast.error("Failed to cancel order");
                                                    }
                                                },
                                            })
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── TABLES VIEW ── */}
                    {activeMainSection === "tables" && (
                        <div className="h-full p-8 overflow-auto">
                            <div className="flex items-center gap-3 mb-8">
                                <h2 className="text-2xl font-black tracking-tight">
                                    Select a Table
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={refreshTables}
                                    title="Refresh tables"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {filteredTables.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <LayoutGrid className="w-12 h-12 mb-3 opacity-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest">
                                        No tables configured
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {filteredTables.map((table) => {
                                        const isActive = selectedTableId === table.id;
                                        const statusStyle =
                                            TABLE_STATUS_STYLES[table.status] ??
                                            TABLE_STATUS_STYLES.AVAILABLE;
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
                                                            ? "Current"
                                                            : TABLE_STATUS_LABELS[table.status] ??
                                                              table.status}
                                                    </span>
                                                </div>
                                                {table.status === "OCCUPIED" && !isActive && (
                                                    <Badge className="absolute -top-2 -right-2 px-1.5 h-5 font-black text-[9px] bg-red-500">
                                                        ACTIVE
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

                {/* RIGHT CART SIDEBAR */}
                <aside className="w-80 lg:w-96 flex flex-col h-full flex-shrink-0 border-l border-border bg-card/20">
                    <OrderCart
                        items={cart}
                        orderMode={orderMode}
                        selectedTable={selectedTable?.name}
                        staffName={session?.name}
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
                    />
                </aside>
            </div>

            {/* Payment modal — passes real orderId so receipt + discount work */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={finalizeOrder}
                total={payingOrderTotal || cartTotal}
                method={paymentMethod}
                businessId={station.businessId}
                orderId={payingOrderId ?? undefined}
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

function ActiveOrderCard({
    order,
    onPay,
    onCancel,
}: {
    order: Order;
    onPay: (method: "cash" | "card") => void;
    onCancel: () => void;
}) {
    const time = new Date(order.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

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
                                    {order.table?.name ?? (order.type === "dine_in" ? "Table" : "Takeaway")}
                                </h3>
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">
                                    {order.status}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {time}
                        </span>
                    </div>

                    <div className="space-y-1 mb-5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                            Total: ${Number(order.totalAmount).toFixed(2)}
                        </p>
                        {order.items.slice(0, 2).map((it, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                                {it.quantity}× {it.nameSnapshot ?? "Item"}
                            </p>
                        ))}
                        {order.items.length > 2 && (
                            <p className="text-[10px] text-muted-foreground font-bold">
                                + {order.items.length - 2} more items
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            className="font-black text-[10px] h-10 gap-2"
                            onClick={() => onPay("card")}
                        >
                            <CreditCard className="w-3 h-3" />
                            PAY CARD
                        </Button>
                        <Button
                            variant="outline"
                            className="font-black text-[10px] h-10 gap-2"
                            onClick={() => onPay("cash")}
                        >
                            <Settings className="w-3 h-3" />
                            PAY CASH
                        </Button>
                        <Button
                            variant="ghost"
                            className="col-span-2 text-destructive/40 hover:text-destructive hover:bg-destructive/10 font-bold text-[9px] h-8 uppercase tracking-widest mt-1"
                            onClick={onCancel}
                        >
                            Cancel & Void Order
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
