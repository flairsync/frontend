import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus, Pencil, Trash2, Search, History, AlertTriangle, Layers,
    ChevronLeft, ChevronRight, ChevronsUpDown, Check, X, ChevronUp, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

import { useInventory } from "@/features/inventory/useInventory";
import { useInventoryGroups } from "@/features/inventory/useInventoryGroups";
import { useInventoryUnits } from "@/features/inventory/useInventoryUnits";

import { InventoryItemModal } from "@/components/management/inventory/InventoryItemModal";
import { AdjustStockModal } from "@/components/management/inventory/AdjustStockModal";
import { ManageGroupsModal } from "@/components/management/inventory/ManageGroupsModal";
import { MovementHistoryDrawer } from "@/components/management/inventory/MovementHistoryDrawer";
import { InventoryDashboardCards } from "@/components/management/inventory/InventoryDashboardCards";
import { LowStockItemsView } from "@/components/management/inventory/LowStockItemsView";
import { MovementTimelineView } from "@/components/management/inventory/MovementTimelineView";
import { ConfirmAction } from "@/components/shared/ConfirmAction";

const BusinessOwnerInventoryManagement: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [activeTab, setActiveTab] = useState("items");

    const [filters, setFilters] = useState({
        search: "",
        barcode: "",
        groupId: "all",
        unitId: "all",
        lowStock: false,
        sortBy: "name",
        sortOrder: "asc" as "asc" | "desc",
    });
    const [currentPage, setCurrentPage] = useState(1);

    const {
        inventoryItems,
        pagination,
        fetchingInventoryItems,
        createItem,
        isCreatingItem,
        updateItem,
        isUpdatingItem,
        deleteItem,
        adjustStock,
        isAdjustingStock,
    } = useInventory(businessId, {
        page: currentPage,
        search: filters.search || undefined,
        barcode: filters.barcode || undefined,
        groupId: filters.groupId === "all" ? undefined : filters.groupId,
        unitId: filters.unitId === "all" ? undefined : Number(filters.unitId),
        lowStock: filters.lowStock || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
    });

    const {
        inventoryGroups,
        createGroup,
        isCreatingGroup,
        updateGroup,
        isUpdatingGroup,
        deleteGroup,
    } = useInventoryGroups(businessId);

    const { inventoryUnits } = useInventoryUnits("all");

    // Modal state
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [adjustingItem, setAdjustingItem] = useState<any>(null);
    const [historyItem, setHistoryItem] = useState<any>(null);

    const handleOpenCreateModal = () => {
        setEditingItem(null);
        setItemModalOpen(true);
    };

    const handleEditItem = (item: any) => {
        setEditingItem(item);
        setItemModalOpen(true);
    };

    const handleSaveItem = async (values: any) => {
        try {
            if (editingItem) {
                await updateItem({ itemId: editingItem.id, data: values });
            } else {
                await createItem(values);
            }
            setItemModalOpen(false);
        } catch {
            // errors handled in hook
        }
    };

    const handleOpenAdjust = (item: any) => {
        setAdjustingItem(item);
        setAdjustModalOpen(true);
    };

    const handleSaveAdjustment = async (itemId: string, data: any) => {
        await adjustStock({ itemId, data });
        setAdjustModalOpen(false);
    };

    const handleOpenHistory = (item: any) => {
        setHistoryItem(item);
        setHistoryDrawerOpen(true);
    };

    const handleCreateGroup = async (name: string) => {
        await createGroup({ name });
    };

    const handleUpdateGroup = async (groupId: string, name: string) => {
        await updateGroup({ groupId, data: { name } });
    };

    const handleDeleteGroup = async (id: string) => {
        await deleteGroup(id);
    };

    const handleDeleteItem = async (id: string) => {
        await deleteItem(id);
    };

    const getUnitName = (unitId: number) =>
        inventoryUnits?.find((u) => u.id === unitId)?.name || String(unitId);

    const toggleSort = (field: string) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
        }));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters.sortBy !== field) return null;
        return filters.sortOrder === "asc"
            ? <ChevronUp className="w-4 h-4 ml-1" />
            : <ChevronDown className="w-4 h-4 ml-1" />;
    };

    const clearFilters = () => {
        setFilters({ search: "", barcode: "", groupId: "all", unitId: "all", lowStock: false, sortBy: "name", sortOrder: "asc" });
        setCurrentPage(1);
    };

    const hasActiveFilters = filters.search || filters.barcode || filters.groupId !== "all" || filters.unitId !== "all" || filters.lowStock;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("inventory_management.title")}</h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setGroupModalOpen(true)} className="flex-1 sm:flex-none gap-2 px-3 h-9">
                        <Layers className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("inventory_management.manage_groups")}</span>
                        <span className="sm:hidden text-xs">Groups</span>
                    </Button>
                    <Button onClick={handleOpenCreateModal} className="flex-1 sm:flex-none gap-2 px-3 h-9">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("inventory_management.add_item")}</span>
                        <span className="sm:hidden text-xs">Add</span>
                    </Button>
                </div>
            </div>

            {/* Dashboard summary cards */}
            <InventoryDashboardCards
                businessId={businessId}
                onLowStockClick={() => setActiveTab("low-stock")}
            />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="items">All Items</TabsTrigger>
                    <TabsTrigger value="low-stock" className="gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low Stock
                    </TabsTrigger>
                    <TabsTrigger value="timeline">Movement Timeline</TabsTrigger>
                </TabsList>

                {/* All Items Tab */}
                <TabsContent value="items">
                    <Card>
                        <CardHeader className="pb-3 px-6 pt-6">
                            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                                {/* Search */}
                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={t("shared.actions.search")}
                                            className="pl-8 h-9"
                                            value={filters.search}
                                            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Search Barcode"
                                        value={filters.barcode}
                                        className="h-9 w-full sm:w-44"
                                        onChange={(e) => { setFilters({ ...filters, barcode: e.target.value }); setCurrentPage(1); }}
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                                    {/* Group filter */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" size="sm" className="w-[140px] justify-between font-normal h-9">
                                                <span className="truncate">
                                                    {filters.groupId === "all"
                                                        ? t("inventory_management.table.group")
                                                        : inventoryGroups?.find((g) => g.id === filters.groupId)?.name || filters.groupId}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="end">
                                            <Command>
                                                <CommandInput placeholder={t("shared.actions.search")} />
                                                <CommandEmpty>No group found.</CommandEmpty>
                                                <CommandList className="max-h-60 overflow-y-auto">
                                                    <CommandGroup>
                                                        <CommandItem value="all" onSelect={() => setFilters({ ...filters, groupId: "all" })}>
                                                            <Check className={cn("mr-2 h-4 w-4", filters.groupId === "all" ? "opacity-100" : "opacity-0")} />
                                                            All Groups
                                                        </CommandItem>
                                                        {inventoryGroups?.map((group) => (
                                                            <CommandItem key={group.id} value={group.name} onSelect={() => setFilters({ ...filters, groupId: group.id })}>
                                                                <Check className={cn("mr-2 h-4 w-4", filters.groupId === group.id ? "opacity-100" : "opacity-0")} />
                                                                {group.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* Unit filter */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" size="sm" className="w-[140px] justify-between font-normal h-9">
                                                <span className="truncate">
                                                    {filters.unitId === "all"
                                                        ? t("inventory_management.table.unit")
                                                        : inventoryUnits?.find((u) => String(u.id) === filters.unitId)?.name || filters.unitId}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="end">
                                            <Command>
                                                <CommandInput placeholder={t("shared.actions.search")} />
                                                <CommandEmpty>No unit found.</CommandEmpty>
                                                <CommandList className="max-h-60 overflow-y-auto">
                                                    <CommandGroup>
                                                        <CommandItem value="all" onSelect={() => setFilters({ ...filters, unitId: "all" })}>
                                                            <Check className={cn("mr-2 h-4 w-4", filters.unitId === "all" ? "opacity-100" : "opacity-0")} />
                                                            All Units
                                                        </CommandItem>
                                                        {inventoryUnits?.map((unit) => (
                                                            <CommandItem key={unit.id} value={unit.name} onSelect={() => setFilters({ ...filters, unitId: String(unit.id) })}>
                                                                <Check className={cn("mr-2 h-4 w-4", filters.unitId === String(unit.id) ? "opacity-100" : "opacity-0")} />
                                                                {unit.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* Low stock toggle */}
                                    <div
                                        className="flex items-center space-x-2 bg-muted/40 px-3 py-1.5 rounded-md h-9 border border-transparent hover:border-muted-foreground/20 transition-colors cursor-pointer select-none"
                                        onClick={() => setFilters({ ...filters, lowStock: !filters.lowStock })}
                                    >
                                        <Checkbox
                                            id="lowStock"
                                            checked={filters.lowStock}
                                            onCheckedChange={(checked) => setFilters({ ...filters, lowStock: !!checked })}
                                        />
                                        <Label htmlFor="lowStock" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                                            {t("inventory_management.low_stock")}
                                        </Label>
                                    </div>

                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                                            <X className="mr-2 h-4 w-4" /> Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="cursor-pointer font-semibold min-w-[160px]" onClick={() => toggleSort("name")}>
                                                    <div className="flex items-center">{t("inventory_management.table.name")} <SortIcon field="name" /></div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer font-semibold" onClick={() => toggleSort("group")}>
                                                    <div className="flex items-center">{t("inventory_management.table.group")} <SortIcon field="group" /></div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer text-right font-semibold" onClick={() => toggleSort("quantity")}>
                                                    <div className="flex items-center justify-end">{t("inventory_management.table.quantity")} <SortIcon field="quantity" /></div>
                                                </TableHead>
                                                <TableHead className="font-semibold">{t("inventory_management.table.unit")}</TableHead>
                                                <TableHead className="text-right font-semibold">{t("inventory_management.table.threshold")}</TableHead>
                                                <TableHead className="text-right font-semibold">{t("inventory_management.table.actions")}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fetchingInventoryItems && !inventoryItems ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground animate-pulse">
                                                        Loading inventory…
                                                    </TableCell>
                                                </TableRow>
                                            ) : !inventoryItems || inventoryItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                        {t("inventory_management.messages.no_items")}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                inventoryItems.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                                                        <TableCell className="font-medium min-w-[160px]">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span>{item.name}</span>
                                                                {item.barcode && (
                                                                    <span className="text-[10px] text-muted-foreground font-mono">{item.barcode}</span>
                                                                )}
                                                                {item.quantity <= item.lowStockThreshold && item.lowStockThreshold > 0 && (
                                                                    <Badge variant="destructive" className="mt-0.5 text-[10px] px-1.5 py-0 h-auto leading-none w-fit flex items-center gap-1">
                                                                        <AlertTriangle className="w-2.5 h-2.5" /> {t("inventory_management.low_stock")}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-normal">
                                                                {item.group?.name || t("inventory_management.form.no_group")}
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
                                                        <TableCell className="text-right text-muted-foreground">{item.lowStockThreshold}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenHistory(item)} title="Movement History">
                                                                    <History className="w-4 h-4 text-muted-foreground" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenAdjust(item)} title={t("inventory_management.adjust_stock")}>
                                                                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                                                    </svg>
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditItem(item)}>
                                                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                                                </Button>
                                                                <ConfirmAction
                                                                    onConfirm={() => handleDeleteItem(item.id)}
                                                                    title={t("shared.actions.delete")}
                                                                    description={t("inventory_management.messages.delete_item_confirm")}
                                                                    confirmText={t("shared.actions.delete")}
                                                                    cancelText={t("shared.actions.cancel")}
                                                                >
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </ConfirmAction>
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
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                    </Button>
                                    <span className="text-sm font-medium">{pagination.current} / {pagination.pages}</span>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                                        disabled={currentPage === pagination.pages}
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Low Stock Tab */}
                <TabsContent value="low-stock">
                    <LowStockItemsView
                        businessId={businessId}
                        onAdjust={handleOpenAdjust}
                        getUnitName={getUnitName}
                    />
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                    <MovementTimelineView businessId={businessId} />
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <InventoryItemModal
                open={itemModalOpen}
                onOpenChange={setItemModalOpen}
                editingItem={editingItem}
                onSave={handleSaveItem}
                isSubmitting={isCreatingItem || isUpdatingItem}
                inventoryUnits={inventoryUnits}
                inventoryGroups={inventoryGroups}
            />

            <AdjustStockModal
                open={adjustModalOpen}
                onOpenChange={setAdjustModalOpen}
                item={adjustingItem}
                onConfirm={handleSaveAdjustment}
                isAdjusting={isAdjustingStock}
                getUnitName={getUnitName}
            />

            <ManageGroupsModal
                open={groupModalOpen}
                onOpenChange={setGroupModalOpen}
                groups={inventoryGroups}
                onCreateGroup={handleCreateGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                isProcessing={isCreatingGroup || isUpdatingGroup}
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

export default BusinessOwnerInventoryManagement;
