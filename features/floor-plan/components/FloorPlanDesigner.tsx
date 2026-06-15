import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DesignerToolbar } from "@/features/floor-plan/components/DesignerToolbar";
import { DesignerCanvas } from "@/features/floor-plan/components/DesignerCanvas";
import { FloorPlanLayout, DesignerElement, DesignerItemType, ApiElementType } from "@/features/floor-plan/components/types";
import { v4 as uuidv4 } from 'uuid';
import { Save, Trash2, RotateCw, Settings2, ZoomIn, ZoomOut, Maximize2, Loader2, ChevronDown, Layers } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableAssignmentDropdown } from "./TableAssignmentDropdown";
import { usePageContext } from "vike-react/usePageContext";
import { useFloors, useTables, useElements } from "@/features/floor-plan/useFloorPlan";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_CANVAS = { gridSize: 20, pixelsPerMeter: 50, widthMeters: 12, heightMeters: 10 };

const ELEMENT_DEFAULTS: Record<string, { w: number; h: number }> = {
    wall: { w: 4, h: 0.2 },
    window: { w: 2, h: 0.2 },
    door: { w: 0.9, h: 0.2 },
    pillar: { w: 0.4, h: 0.4 },
    bar: { w: 3, h: 0.8 },
    stairs: { w: 1.5, h: 1 },
    elevator: { w: 1.2, h: 1.2 },
    plant: { w: 0.6, h: 0.6 },
    wc: { w: 0.6, h: 0.6 },
    label: { w: 1.5, h: 0.5 },
    shape: { w: 1, h: 1 },
};

const tableToElement = (table: any): DesignerElement => ({
    id: `db-${table.id}`,
    type: 'table',
    subType: table.position?.shape || 'rectangle',
    xMeters: table.position?.x ?? 1,
    yMeters: table.position?.y ?? 1,
    widthMeters: table.position?.width ?? 1.2,
    heightMeters: table.position?.height ?? 0.8,
    rotation: table.position?.rotation ?? 0,
    label: table.name || `T${table.number}`,
    tableId: table.id,
});

const apiElementToDesigner = (el: any): DesignerElement => ({
    id: `elem-${el.id}`,
    apiId: el.id,
    type: el.type as ApiElementType,
    subType: 'default',
    xMeters: el.position?.x ?? 0,
    yMeters: el.position?.y ?? 0,
    widthMeters: el.position?.width ?? (ELEMENT_DEFAULTS[el.type]?.w ?? 1),
    heightMeters: el.position?.height ?? (ELEMENT_DEFAULTS[el.type]?.h ?? 1),
    rotation: el.position?.rotation ?? 0,
    label: el.label,
});

const designerToApiPayload = (el: DesignerElement) => ({
    type: el.type as ApiElementType,
    label: el.label,
    position: {
        x: el.xMeters,
        y: el.yMeters,
        width: el.widthMeters,
        height: el.heightMeters,
        rotation: el.rotation,
    },
});

// ─── Component ──────────────────────────────────────────────────────────────

export const FloorPlanDesigner: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { floors, fetchingFloors, refetchFloors } = useFloors(businessId);
    const { tables, fetchingTables, updateTableAsync } = useTables(businessId);
    const { batchCreateElements, updateElement, deleteElement } = useElements(businessId);

    const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
    const [layout, setLayout] = useState<FloorPlanLayout>({
        id: 'init',
        name: 'Loading...',
        elements: [],
        ...DEFAULT_CANVAS,
    });

    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [activeTab, setActiveTab] = useState<'item' | 'canvas'>('item');
    const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Per-floor layout cache so switching floors doesn't lose unsaved changes
    const layoutCache = useRef<Record<string, FloorPlanLayout>>({});
    // Per-floor set of apiIds loaded from server (to detect deleted elements on save)
    const originalApiIds = useRef<Record<string, Set<string>>>({});

    // Auto-select first floor once data is ready
    useEffect(() => {
        if (fetchingFloors || fetchingTables || !floors?.length || selectedFloorId) return;
        selectFloor(floors[0].id);
    }, [floors, tables, fetchingFloors, fetchingTables]);

    // Rebuild selected floor's layout when data loads (first time only)
    useEffect(() => {
        if (!selectedFloorId || fetchingTables || fetchingFloors) return;
        if (layoutCache.current[selectedFloorId]) return;
        loadFloor(selectedFloorId);
    }, [selectedFloorId, fetchingTables, fetchingFloors, floors, tables]);

    const loadFloor = (floorId: string) => {
        const floor = floors?.find((f: any) => f.id === floorId);
        if (!floor) return;

        const floorTables = (tables || []).filter((t: any) => t.floorId === floorId);
        const tableElements = floorTables.map(tableToElement);

        // Load elements that are already stored on the server (from GET /floors)
        const serverElements: DesignerElement[] = (floor.elements || []).map(apiElementToDesigner);

        // Track which element apiIds we loaded so we can detect deletions on save
        originalApiIds.current[floorId] = new Set(serverElements.map(e => e.apiId!));

        const newLayout: FloorPlanLayout = {
            id: floorId,
            name: floor.name || 'Floor',
            elements: [...serverElements, ...tableElements],
            ...DEFAULT_CANVAS,
        };

        layoutCache.current[floorId] = newLayout;
        setLayout(newLayout);
    };

    const selectFloor = (floorId: string) => {
        if (floorId === selectedFloorId) return;

        if (selectedFloorId) {
            layoutCache.current[selectedFloorId] = layout;
        }

        setSelectedFloorId(floorId);
        setSelectedElementId(null);
        setZoom(1);

        if (layoutCache.current[floorId]) {
            setLayout(layoutCache.current[floorId]);
        } else if (!fetchingTables && !fetchingFloors) {
            loadFloor(floorId);
        }
    };

    // ── Element handlers ────────────────────────────────────────────────────

    const handleAddItem = useCallback((type: DesignerItemType, subType: string) => {
        const isTable = type === 'table';
        const existingCount = layout.elements.filter(e => e.type === type).length;
        const col = existingCount % 5;
        const row = Math.floor(existingCount / 5);

        const defaults = isTable
            ? { w: subType === 'circle' || subType === 'square' ? 0.9 : 1.2, h: subType === 'circle' || subType === 'square' ? 0.9 : 0.8 }
            : (ELEMENT_DEFAULTS[type] ?? { w: 1, h: 1 });

        const newItem: DesignerElement = {
            id: uuidv4(),
            type,
            subType,
            xMeters: 1 + col * 1.5,
            yMeters: 1 + row * 1.5,
            widthMeters: defaults.w,
            heightMeters: defaults.h,
            rotation: 0,
            label: isTable ? `T${layout.elements.filter(e => e.type === 'table').length + 1}` : undefined,
        };

        const updated = { ...layout, elements: [...layout.elements, newItem] };
        setLayout(updated);
        if (selectedFloorId) layoutCache.current[selectedFloorId] = updated;
        setSelectedElementId(newItem.id);
    }, [layout, selectedFloorId]);

    const handleUpdateItem = useCallback((id: string, updates: Partial<DesignerElement>) => {
        setLayout(prev => {
            const updated = {
                ...prev,
                elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el),
            };
            if (selectedFloorId) layoutCache.current[selectedFloorId] = updated;
            return updated;
        });
    }, [selectedFloorId]);

    const handleDeleteItem = useCallback((id: string) => {
        setLayout(prev => {
            const updated = { ...prev, elements: prev.elements.filter(el => el.id !== id) };
            if (selectedFloorId) layoutCache.current[selectedFloorId] = updated;
            return updated;
        });
        if (selectedElementId === id) setSelectedElementId(null);
    }, [selectedElementId, selectedFloorId]);

    const handleRotate = useCallback((id: string) => {
        handleUpdateItem(id, { rotation: (layout.elements.find(e => e.id === id)?.rotation || 0) + 90 });
    }, [layout.elements, handleUpdateItem]);

    useEffect(() => {
        if (selectedElementId) setActiveTab('item');
    }, [selectedElementId]);

    // ── Save ────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!selectedFloorId) return;
        setIsSaving(true);
        try {
            // 1. Push each linked table's position to the DB
            const linkedTableEls = layout.elements.filter(e => e.type === 'table' && e.tableId);
            await Promise.all(
                linkedTableEls.map(el =>
                    updateTableAsync({
                        tableId: el.tableId!,
                        data: {
                            position: {
                                x: el.xMeters,
                                y: el.yMeters,
                                shape: el.subType as any,
                                width: el.widthMeters,
                                height: el.heightMeters,
                                rotation: el.rotation,
                            },
                        },
                    })
                )
            );

            // 2. Non-table elements
            const elementEls = layout.elements.filter(e => e.type !== 'table');
            const currentApiIdSet = new Set(elementEls.filter(e => e.apiId).map(e => e.apiId!));
            const prevApiIds = originalApiIds.current[selectedFloorId] || new Set<string>();

            // Delete elements removed from the canvas
            const toDelete = [...prevApiIds].filter(id => !currentApiIdSet.has(id));
            await Promise.all(toDelete.map(id => deleteElement(id)));

            // Batch-create new elements (no apiId yet)
            const toCreate = elementEls.filter(e => !e.apiId);
            let createdElements: any[] = [];
            if (toCreate.length > 0) {
                const resp = await batchCreateElements({
                    floorId: selectedFloorId,
                    elements: toCreate.map(designerToApiPayload),
                });
                const respData = resp?.data;
                createdElements = respData?.data ?? respData ?? [];
                if (!Array.isArray(createdElements)) createdElements = [];
            }

            // PATCH existing elements (already have apiId)
            const toUpdate = elementEls.filter(e => e.apiId);
            await Promise.all(
                toUpdate.map(el =>
                    updateElement({ elementId: el.apiId!, data: designerToApiPayload(el) })
                )
            );

            // Assign the new apiIds returned from batch-create back to the local elements
            if (createdElements.length > 0) {
                setLayout(prev => {
                    let newIdx = 0;
                    const updatedElements = prev.elements.map(el => {
                        if (!el.apiId && el.type !== 'table') {
                            const created = createdElements[newIdx++];
                            if (created?.id) return { ...el, apiId: created.id };
                        }
                        return el;
                    });
                    const updatedLayout = { ...prev, elements: updatedElements };
                    if (selectedFloorId) layoutCache.current[selectedFloorId] = updatedLayout;
                    return updatedLayout;
                });
            }

            // Update the tracked set of server-side IDs for this floor
            const newApiIds = new Set([
                ...toUpdate.map(e => e.apiId!),
                ...createdElements.filter((e: any) => e?.id).map((e: any) => e.id),
            ]);
            originalApiIds.current[selectedFloorId] = newApiIds;

            toast.success("Floor plan saved!");
        } catch {
            toast.error("Failed to save — check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Zoom to fit ─────────────────────────────────────────────────────────

    const handleFitZoom = () => {
        setZoom(1);
    };

    const selectedElement = layout.elements.find(e => e.id === selectedElementId);
    const floorTables = (tables || []).filter((t: any) => t.floorId === selectedFloorId);

    const isLoadingFloor = fetchingFloors || fetchingTables;

    return (
        <div className="flex flex-col gap-3 h-full min-h-0">

            {/* ── Top bar ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between bg-white px-4 py-2 border rounded-xl shadow-sm shrink-0 gap-3 flex-wrap">

                {/* Floor switcher */}
                <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0 hidden sm:block">Floor:</span>

                    {fetchingFloors ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                        </div>
                    ) : !floors?.length ? (
                        <span className="text-xs text-muted-foreground">No floors yet — create one in the Floors tab.</span>
                    ) : floors.length <= 5 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                            {floors.map((floor: any) => (
                                <button
                                    key={floor.id}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                                        selectedFloorId === floor.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    )}
                                    onClick={() => selectFloor(floor.id)}
                                >
                                    {floor.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Select value={selectedFloorId || ''} onValueChange={selectFloor}>
                            <SelectTrigger className="h-7 text-xs w-40">
                                <SelectValue placeholder="Select floor" />
                            </SelectTrigger>
                            <SelectContent>
                                {floors.map((f: any) => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {selectedFloorId && (
                        <>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                                {layout.widthMeters}m × {layout.heightMeters}m
                            </span>
                        </>
                    )}
                </div>

                {/* Zoom + Save */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>
                            <ZoomOut className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-[11px] w-11 text-center font-mono font-bold tracking-tight">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(5, z + 0.1))}>
                            <ZoomIn className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFitZoom} title="Reset zoom">
                            <Maximize2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 shadow-sm"
                        onClick={handleSave}
                        disabled={isSaving || !selectedFloorId}
                    >
                        {isSaving
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Save className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Save</span>
                    </Button>
                </div>
            </div>

            {/* ── Main area ────────────────────────────────────────── */}
            <div className="flex gap-3 flex-1 min-h-0">

                {/* Left toolbar */}
                <DesignerToolbar
                    onAddItem={handleAddItem}
                    isCollapsed={toolbarCollapsed}
                    onToggleCollapse={() => setToolbarCollapsed(v => !v)}
                />

                {/* Canvas */}
                <div className="flex-1 bg-slate-100 border rounded-xl relative shadow-inner min-w-0 overflow-hidden">
                    {isLoadingFloor && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded-xl">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                    {!selectedFloorId && !isLoadingFloor && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Layers className="w-10 h-10 opacity-20" />
                            <p className="text-sm font-medium">Select a floor to start designing</p>
                        </div>
                    )}
                    {selectedFloorId && (
                        <DesignerCanvas
                            layout={layout}
                            onUpdateItem={handleUpdateItem}
                            selectedId={selectedElementId}
                            onSelect={setSelectedElementId}
                            zoom={zoom}
                            onZoomChange={setZoom}
                        />
                    )}
                </div>

                {/* Right sidebar */}
                {!sidebarCollapsed && (
                    <Card className="w-60 xl:w-64 shadow-sm shrink-0 flex flex-col overflow-hidden">
                        <div className="flex border-b shrink-0">
                            <button
                                className={cn("flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                                    activeTab === 'item' ? 'bg-white border-b-2 border-primary' : 'bg-slate-50 text-muted-foreground')}
                                onClick={() => setActiveTab('item')}
                            >
                                Item
                            </button>
                            <button
                                className={cn("flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                                    activeTab === 'canvas' ? 'bg-white border-b-2 border-primary' : 'bg-slate-50 text-muted-foreground')}
                                onClick={() => setActiveTab('canvas')}
                            >
                                Canvas
                            </button>
                            <button
                                className="px-2 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setSidebarCollapsed(true)}
                                title="Collapse sidebar"
                            >
                                <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                            </button>
                        </div>

                        <CardContent className="p-4 space-y-5 flex-1 overflow-y-auto">
                            {activeTab === 'item' ? (
                                selectedElement ? (
                                    <ItemPanel
                                        el={selectedElement}
                                        businessId={businessId}
                                        floorTables={floorTables}
                                        tables={tables}
                                        onUpdate={handleUpdateItem}
                                        onRotate={handleRotate}
                                        onDelete={handleDeleteItem}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                        <Settings2 className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-sm">No element selected</p>
                                        <p className="text-[10px] opacity-60 mt-1">Click an item on the canvas</p>
                                    </div>
                                )
                            ) : (
                                <CanvasPanel layout={layout} setLayout={setLayout} layoutCache={layoutCache} selectedFloorId={selectedFloorId} />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Sidebar toggle when collapsed */}
                {sidebarCollapsed && (
                    <button
                        className="shrink-0 w-6 flex items-center justify-center bg-white border rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                        onClick={() => setSidebarCollapsed(false)}
                        title="Expand sidebar"
                    >
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-muted-foreground" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Item panel ──────────────────────────────────────────────────────────────

interface ItemPanelProps {
    el: DesignerElement;
    businessId: string;
    floorTables: any[];
    tables: any[];
    onUpdate: (id: string, updates: Partial<DesignerElement>) => void;
    onRotate: (id: string) => void;
    onDelete: (id: string) => void;
}

const ItemPanel: React.FC<ItemPanelProps> = ({ el, businessId, floorTables, tables, onUpdate, onRotate, onDelete }) => (
    <div className="space-y-5">
        <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Label / Name</Label>
            <Input
                type="text"
                className="h-8 text-sm"
                value={el.label || ""}
                onChange={(e) => onUpdate(el.id, { label: e.target.value })}
            />
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Size (meters)</Label>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Width</Label>
                    <Input
                        type="number" step="0.1" className="h-8 text-sm"
                        value={el.widthMeters}
                        onChange={(e) => onUpdate(el.id, { widthMeters: Math.max(0.1, Number(e.target.value)) })}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Height</Label>
                    <Input
                        type="number" step="0.1" className="h-8 text-sm"
                        value={el.heightMeters}
                        onChange={(e) => onUpdate(el.id, { heightMeters: Math.max(0.1, Number(e.target.value)) })}
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Rotation</Label>
            <div className="grid grid-cols-2 gap-2">
                <Input
                    type="number" className="h-8 text-sm"
                    value={el.rotation}
                    onChange={(e) => onUpdate(el.id, { rotation: Number(e.target.value) % 360 })}
                />
                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onRotate(el.id)}>
                    <RotateCw className="w-3.5 h-3.5 text-blue-500" /> +90°
                </Button>
            </div>
        </div>

        {el.type === 'table' && (
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Linked DB Table
                </Label>
                <TableAssignmentDropdown
                    businessId={businessId}
                    floorId={el.tableId ? undefined : undefined}
                    value={el.tableId || ""}
                    onChange={(val) => {
                        const dbTable = tables?.find((t: any) => t.id === val);
                        onUpdate(el.id, {
                            tableId: val === "none" ? undefined : val,
                            label: dbTable ? (dbTable.name || `T${dbTable.number}`) : el.label,
                        });
                    }}
                />
                {el.tableId && (
                    <p className="text-[10px] text-green-600 font-medium">
                        Linked — position will be saved to the database.
                    </p>
                )}
                {!el.tableId && (
                    <p className="text-[10px] text-amber-600">
                        Unlinked — won't appear in reservations/orders.
                    </p>
                )}
            </div>
        )}

        {el.type !== 'table' && el.apiId && (
            <p className="text-[10px] text-green-600 font-medium">Saved to database.</p>
        )}
        {el.type !== 'table' && !el.apiId && (
            <p className="text-[10px] text-amber-600">Not yet saved — hit Save to persist.</p>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t">
            <Button
                variant="outline" size="sm"
                className="w-full gap-2 justify-start text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(el.id)}
            >
                <Trash2 className="w-4 h-4" /> Remove Item
            </Button>
        </div>
    </div>
);

// ─── Canvas settings panel ───────────────────────────────────────────────────

interface CanvasPanelProps {
    layout: FloorPlanLayout;
    setLayout: React.Dispatch<React.SetStateAction<FloorPlanLayout>>;
    layoutCache: React.MutableRefObject<Record<string, FloorPlanLayout>>;
    selectedFloorId: string | null;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({ layout, setLayout, layoutCache, selectedFloorId }) => {
    const update = (patch: Partial<FloorPlanLayout>) => {
        setLayout(prev => {
            const updated = { ...prev, ...patch };
            if (selectedFloorId) layoutCache.current[selectedFloorId] = updated;
            return updated;
        });
    };

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Floor Name</Label>
                <Input
                    type="text" className="h-8 text-sm"
                    value={layout.name}
                    onChange={(e) => update({ name: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Canvas Size (meters)</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500">Width</Label>
                        <Input
                            type="number" className="h-8 text-sm"
                            value={layout.widthMeters}
                            onChange={(e) => update({ widthMeters: Math.max(4, Number(e.target.value)) })}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500">Height</Label>
                        <Input
                            type="number" className="h-8 text-sm"
                            value={layout.heightMeters}
                            onChange={(e) => update({ heightMeters: Math.max(4, Number(e.target.value)) })}
                        />
                    </div>
                </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-1.5">
                <p className="text-[10px] text-blue-700 font-bold uppercase">Tips</p>
                <p className="text-[10px] text-blue-600 leading-relaxed">
                    <b>Scroll</b> to pan · <b>Shift/Ctrl+Scroll</b> to zoom<br />
                    <b>Alt+Drag</b> on canvas to pan<br />
                    <b>Shift+Drag</b> rotation handle for 15° snapping<br />
                    Elements and linked tables are saved to the database on Save.
                </p>
            </div>
        </div>
    );
};
