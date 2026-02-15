import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
// Formik and imports removed as they are now used in the separate component
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, History, AlertTriangle, Layers } from "lucide-react";
import { useInventory } from "@/features/inventory/useInventory";
import { useInventoryGroups } from "@/features/inventory/useInventoryGroups";
import { useInventoryUnits } from "@/features/inventory/useInventoryUnits";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
// Removed Textarea, Checkbox if not used elsewhere, kept Label as it is used in Filter
import { Checkbox } from "@/components/ui/checkbox";
// Removed InventoryItemSchema import
import {
    ChevronUp,
    ChevronDown,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { InventoryItemModal } from "@/components/management/inventory/InventoryItemModal";
import { AdjustStockModal } from "@/components/management/inventory/AdjustStockModal";
import { ManageGroupsModal } from "@/components/management/inventory/ManageGroupsModal";
import { ConfirmAction } from "@/components/shared/ConfirmAction";

const BusinessOwnerInventoryManagement: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    // State for filtering and sorting
    const [filters, setFilters] = useState({
        search: "",
        barcode: "",
        groupId: "all",
        unitId: "all",
        lowStock: false,
        sortBy: "name",
        sortOrder: "asc" as "asc" | "desc"
    });

    const [currentPage, setCurrentPage] = useState(1);

    // Hooks
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
        isAdjustingStock
    } = useInventory(businessId, {
        page: currentPage,
        search: filters.search,
        barcode: filters.barcode,
        groupId: filters.groupId === "all" ? undefined : filters.groupId,
        unitId: filters.unitId === "all" ? undefined : Number(filters.unitId),
        lowStock: filters.lowStock || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
    });

    const {
        inventoryGroups,
        fetchingInventoryGroups,
        createGroup,
        isCreatingGroup,
        updateGroup,
        isUpdatingGroup,
        deleteGroup
    } = useInventoryGroups(businessId);

    const { inventoryUnits } = useInventoryUnits("all");

    // Local State
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [groupModalOpen, setGroupModalOpen] = useState(false);

    const [editingItem, setEditingItem] = useState<any>(null);
    const [adjustingItem, setAdjustingItem] = useState<any>(null);
    // Removed local formData state as Formik will handle it

    // Handlers
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
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenAdjust = (item: any) => {
        setAdjustingItem(item);
        setAdjustModalOpen(true);
    };

    const handleSaveAdjustment = async (itemId: string, data: { adjustment: number; reason: string }) => {
        if (!adjustingItem) return;
        try {
            await adjustStock({ itemId, data });
            setAdjustModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateGroup = async (name: string) => {
        try {
            await createGroup({ name });
            setGroupModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateGroup = async (groupId: string, name: string) => {
        try {
            await updateGroup({ groupId, data: { name } });
            setGroupModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteGroup = async (id: string) => {
        if (confirm(t("inventory_management.messages.delete_group_confirm"))) {
            await deleteGroup(id);
        }
    };

    // Removed handleEditGroup as it's now internal to ManageGroupsModal or simplified

    const handleDeleteItem = async (id: string) => {
        await deleteItem(id);
    };

    const getUnitName = (unitId: number) => {
        return inventoryUnits?.find(u => u.id === unitId)?.name || String(unitId);
    };

    const toggleSort = (field: string) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
        }));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters.sortBy !== field) return null;
        return filters.sortOrder === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            barcode: "",
            groupId: "all",
            unitId: "all",
            lowStock: false,
            sortBy: "name",
            sortOrder: "asc"
        });
    };

    return (
        <div className="p-6 space-y-6">
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

            <Card>
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                        {/* Search Controls */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t("shared.actions.search")}
                                    className="pl-8 h-9"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>

                            <div className="relative w-full sm:w-48">
                                <Input
                                    placeholder={t("inventory_management.search_barcode") || "Search Barcode"}
                                    value={filters.barcode}
                                    className="h-9"
                                    onChange={(e) => setFilters({ ...filters, barcode: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                            <div className="flex items-center gap-2 shrink-0">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="sm"
                                            className="w-[140px] justify-between font-normal h-9 bg-background/50"
                                        >
                                            <span className="truncate">
                                                {filters.groupId === "all"
                                                    ? t("inventory_management.table.group")
                                                    : inventoryGroups?.find(g => g.id === filters.groupId)?.name || filters.groupId}
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
                                                    <CommandItem
                                                        value="all"
                                                        onSelect={() => setFilters({ ...filters, groupId: "all" })}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", filters.groupId === "all" ? "opacity-100" : "opacity-0")} />
                                                        {t("inventory_management.all_items")}
                                                    </CommandItem>
                                                    {inventoryGroups?.map((group) => (
                                                        <CommandItem
                                                            key={group.id}
                                                            value={group.name}
                                                            onSelect={() => setFilters({ ...filters, groupId: group.id })}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", filters.groupId === group.id ? "opacity-100" : "opacity-0")} />
                                                            {group.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            size="sm"
                                            className="w-[140px] justify-between font-normal h-9 bg-background/50"
                                        >
                                            <span className="truncate">
                                                {filters.unitId === "all"
                                                    ? t("inventory_management.table.unit")
                                                    : inventoryUnits?.find(u => String(u.id) === filters.unitId)?.name || filters.unitId}
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
                                                    <CommandItem
                                                        value="all"
                                                        onSelect={() => setFilters({ ...filters, unitId: "all" })}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", filters.unitId === "all" ? "opacity-100" : "opacity-0")} />
                                                        {t("shared.actions.all")}
                                                    </CommandItem>
                                                    {inventoryUnits?.map((unit) => (
                                                        <CommandItem
                                                            key={unit.id}
                                                            value={unit.name}
                                                            onSelect={() => setFilters({ ...filters, unitId: String(unit.id) })}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", filters.unitId === String(unit.id) ? "opacity-100" : "opacity-0")} />
                                                            {unit.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-center space-x-2 bg-muted/40 px-3 py-1.5 rounded-md h-9 border border-transparent hover:border-muted-foreground/20 transition-colors cursor-pointer select-none"
                                onClick={() => setFilters({ ...filters, lowStock: !filters.lowStock })}>
                                <Checkbox
                                    id="lowStock"
                                    checked={filters.lowStock}
                                    onCheckedChange={(checked) => setFilters({ ...filters, lowStock: !!checked })}
                                />
                                <Label htmlFor="lowStock" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                                    {t("inventory_management.low_stock")}
                                </Label>
                            </div>

                            {(filters.search || filters.barcode || filters.groupId !== "all" || filters.unitId !== "all" || filters.lowStock) && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                                    <X className="mr-2 h-4 w-4" />
                                    {t("shared.actions.clear") || "Clear"}
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
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium">
                                                Loading inventory...
                                            </TableCell>
                                        </TableRow>
                                    ) : !inventoryItems || inventoryItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium">
                                                {t("inventory_management.messages.no_items")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        inventoryItems.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-medium min-w-[160px]">
                                                    <div className="flex flex-col">
                                                        <span>{item.name}</span>
                                                        {item.barcode && <span className="text-[10px] text-muted-foreground font-normal">{item.barcode}</span>}
                                                    </div>
                                                    {item.quantity <= item.lowStockThreshold && (
                                                        <Badge variant="destructive" className="mt-1.5 text-[10px] px-1.5 py-0.5 h-auto leading-none w-fit flex items-center shrink-0">
                                                            <AlertTriangle className="w-2.5 h-2.5 mr-1" /> {t("inventory_management.low_stock")}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal">
                                                        {item.group?.name || t("inventory_management.form.no_group")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={cn(
                                                        "inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-full text-sm font-bold",
                                                        item.quantity <= item.lowStockThreshold ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                                    )}>
                                                        {item.quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{getUnitName(item.unitId)}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{item.lowStockThreshold}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenAdjust(item)} title={t("inventory_management.adjust_stock")}>
                                                            <History className="w-4 h-4 text-muted-foreground" />
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

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                {t("shared.actions.previous") || "Previous"}
                            </Button>
                            <span className="text-sm font-medium">
                                {pagination.current} / {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                disabled={currentPage === pagination.pages}
                            >
                                {t("shared.actions.next") || "Next"}
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Item Dialog */}
            <InventoryItemModal
                open={itemModalOpen}
                onOpenChange={setItemModalOpen}
                editingItem={editingItem}
                onSave={handleSaveItem}
                isSubmitting={isCreatingItem || isUpdatingItem}
                inventoryUnits={inventoryUnits}
                inventoryGroups={inventoryGroups}
            />

            {/* Adjust Stock Dialog */}
            <AdjustStockModal
                open={adjustModalOpen}
                onOpenChange={setAdjustModalOpen}
                item={adjustingItem}
                onConfirm={handleSaveAdjustment}
                isAdjusting={isAdjustingStock}
                getUnitName={getUnitName}
            />

            {/* Groups Management Dialog */}
            <ManageGroupsModal
                open={groupModalOpen}
                onOpenChange={setGroupModalOpen}
                groups={inventoryGroups}
                onCreateGroup={handleCreateGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                isProcessing={isCreatingGroup || isUpdatingGroup}
            />
        </div>
    );
};

export default BusinessOwnerInventoryManagement;
