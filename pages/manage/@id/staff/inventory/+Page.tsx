import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Search, History, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { useInventory } from "@/features/inventory/useInventory";
import { useInventoryUnits } from "@/features/inventory/useInventoryUnits";
import { MovementHistoryDrawer } from "@/components/management/inventory/MovementHistoryDrawer";
import { LowStockItemsView } from "@/components/management/inventory/LowStockItemsView";
import { InventoryDashboardCards } from "@/components/management/inventory/InventoryDashboardCards";
import { AdjustStockModal } from "@/components/management/inventory/AdjustStockModal";

const StaffInventoryPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [activeTab, setActiveTab] = useState("items");
    const [search, setSearch] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [historyItem, setHistoryItem] = useState<any>(null);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [adjustingItem, setAdjustingItem] = useState<any>(null);

    const { inventoryItems, pagination, fetchingInventoryItems, adjustStock, isAdjustingStock } = useInventory(businessId, {
        page: currentPage,
        search: search || undefined,
        lowStock: lowStockOnly || undefined,
        limit: 20,
    });

    const { inventoryUnits } = useInventoryUnits("all");

    const getUnitName = (unitId: number) =>
        inventoryUnits?.find((u) => u.id === unitId)?.name || String(unitId);

    const handleOpenHistory = (item: any) => {
        setHistoryItem(item);
        setHistoryDrawerOpen(true);
    };

    const handleOpenAdjust = (item: any) => {
        setAdjustingItem(item);
        setAdjustModalOpen(true);
    };

    const handleSaveAdjustment = async (itemId: string, data: any) => {
        await adjustStock({ itemId, data });
        setAdjustModalOpen(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory</h1>
            </div>

            <InventoryDashboardCards
                businessId={businessId}
                onLowStockClick={() => setActiveTab("low-stock")}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="items">All Items</TabsTrigger>
                    <TabsTrigger value="low-stock" className="gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low Stock
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                    <Card>
                        <CardHeader className="pb-3 px-6 pt-6">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search items…"
                                        className="pl-8 h-9"
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                                <div
                                    className="flex items-center space-x-2 bg-muted/40 px-3 py-1.5 rounded-md h-9 border border-transparent hover:border-muted-foreground/20 transition-colors cursor-pointer select-none"
                                    onClick={() => setLowStockOnly((v) => !v)}
                                >
                                    <Checkbox id="staff-lowStock" checked={lowStockOnly} onCheckedChange={(c) => setLowStockOnly(!!c)} />
                                    <Label htmlFor="staff-lowStock" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                                        Low Stock Only
                                    </Label>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="font-semibold min-w-[160px]">Name</TableHead>
                                                <TableHead className="font-semibold">Group</TableHead>
                                                <TableHead className="text-right font-semibold">Stock</TableHead>
                                                <TableHead className="font-semibold">Unit</TableHead>
                                                <TableHead className="text-right font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fetchingInventoryItems && !inventoryItems ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground animate-pulse">
                                                        Loading…
                                                    </TableCell>
                                                </TableRow>
                                            ) : !inventoryItems || inventoryItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                        No items found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                inventoryItems.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                                                        <TableCell className="font-medium min-w-[160px]">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span>{item.name}</span>
                                                                {item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0 && (
                                                                    <Badge variant="destructive" className="mt-0.5 text-[10px] px-1.5 py-0 h-auto leading-none w-fit flex items-center gap-1">
                                                                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-normal">
                                                                {item.group?.name || "Default"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={cn(
                                                                "inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full text-sm font-bold",
                                                                item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0
                                                                    ? "bg-destructive/10 text-destructive"
                                                                    : "bg-primary/10 text-primary"
                                                            )}>
                                                                {item.quantity}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{getUnitName(item.unitId)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenHistory(item)} title="Movement History">
                                                                    <History className="w-4 h-4 text-muted-foreground" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleOpenAdjust(item)}>
                                                                    Adjust
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {pagination && pagination.pages > 1 && (
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                    </Button>
                                    <span className="text-sm font-medium">{pagination.current} / {pagination.pages}</span>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))} disabled={currentPage === pagination.pages}>
                                        Next <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="low-stock">
                    <LowStockItemsView
                        businessId={businessId}
                        onAdjust={handleOpenAdjust}
                        getUnitName={getUnitName}
                    />
                </TabsContent>
            </Tabs>

            <AdjustStockModal
                open={adjustModalOpen}
                onOpenChange={setAdjustModalOpen}
                item={adjustingItem}
                onConfirm={handleSaveAdjustment}
                isAdjusting={isAdjustingStock}
                getUnitName={getUnitName}
            />

            <MovementHistoryDrawer
                open={historyDrawerOpen}
                onOpenChange={setHistoryDrawerOpen}
                item={historyItem}
                businessId={businessId}
            />
        </div>
    );
};

export default StaffInventoryPage;
