import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DesignerToolbar } from "@/features/floor-plan/components/DesignerToolbar";
import { DesignerCanvas } from "@/features/floor-plan/components/DesignerCanvas";
import { FloorPlanLayout, DesignerElement, DesignerItemType } from "@/features/floor-plan/components/types";
import { v4 as uuidv4 } from 'uuid';
import { Save, Trash2, RotateCw, Settings2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FloorPlanDesigner: React.FC<{ initialLayout?: FloorPlanLayout }> = ({ initialLayout }) => {
    const [layout, setLayout] = useState<FloorPlanLayout>(initialLayout || {
        id: uuidv4(),
        name: "Main Floor",
        elements: [],
        gridSize: 20, // Grid size in pixels for snapping (visual)
        pixelsPerMeter: 50, // 50px = 1 meter
        widthMeters: 10,
        heightMeters: 8,
    });

    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [activeTab, setActiveTab] = useState<'item' | 'canvas'>('item');

    useEffect(() => {
        if (selectedElementId) setActiveTab('item');
    }, [selectedElementId]);

    const handleAddItem = useCallback((type: DesignerItemType, subType: string) => {
        const newItem: DesignerElement = {
            id: uuidv4(),
            type,
            subType,
            xMeters: 2,
            yMeters: 2,
            widthMeters: type === 'wall' ? 4 : (type === 'table' ? 0.8 : 0.5),
            heightMeters: type === 'wall' ? 0.2 : (type === 'table' ? 0.8 : 0.5),
            rotation: 0,
            label: type === 'table' ? `T${layout.elements.filter(e => e.type === 'table').length + 1}` : undefined
        };
        setLayout(prev => ({ ...prev, elements: [...prev.elements, newItem] }));
        setSelectedElementId(newItem.id);
    }, [layout.elements]);

    const handleUpdateItem = useCallback((id: string, updates: Partial<DesignerElement>) => {
        setLayout(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    }, []);

    const handleDeleteItem = useCallback((id: string) => {
        setLayout(prev => ({
            ...prev,
            elements: prev.elements.filter(el => el.id !== id)
        }));
        if (selectedElementId === id) setSelectedElementId(null);
    }, [selectedElementId]);

    const handleRotate = useCallback((id: string) => {
        setLayout(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === id ? { ...el, rotation: (el.rotation + 90) % 360 } : el)
        }));
    }, []);

    const handleSave = () => {
        toast.success("Floor plan saved successfully!");
        console.log("Saving metrics layout:", layout);
    };

    const selectedElement = layout.elements.find(e => e.id === selectedElementId);

    return (
        <div className="flex flex-col gap-4 h-[800px]">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-white p-2 border rounded-xl shadow-sm">
                <div className="flex items-center gap-6 px-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Floor Name</span>
                        <span className="text-sm font-semibold">{layout.name}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Dimensions</span>
                        <span className="text-sm font-semibold">{layout.widthMeters}m x {layout.heightMeters}m</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}>
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs w-14 text-center font-mono font-bold tracking-tight">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(5, z + 0.1))}>
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={() => setZoom(1)}>
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button variant="default" size="sm" className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={handleSave}>
                        <Save className="w-4 h-4" /> Save Layout
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
                <DesignerToolbar onAddItem={handleAddItem} />

                <div className="flex-1 overflow-auto bg-slate-100 border rounded-xl relative scrollbar-thin scrollbar-thumb-slate-300 shadow-inner">
                    <div className="p-20 w-fit min-w-full min-h-full flex items-center justify-center">
                        <DesignerCanvas
                            layout={layout}
                            onUpdateItem={handleUpdateItem}
                            selectedId={selectedElementId}
                            onSelect={setSelectedElementId}
                            zoom={zoom}
                            onZoomChange={setZoom}
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <Card className="w-72 shadow-sm border-l overflow-y-auto">
                    <CardContent className="p-0">
                        <div className="flex border-b">
                            <button
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'item' ? 'bg-white border-b-2 border-primary' : 'bg-slate-50 text-muted-foreground'}`}
                                onClick={() => setActiveTab('item')}
                            >
                                Item
                            </button>
                            <button
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'canvas' ? 'bg-white border-b-2 border-primary' : 'bg-slate-50 text-muted-foreground'}`}
                                onClick={() => setActiveTab('canvas')}
                            >
                                Canvas
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {activeTab === 'item' ? (
                                selectedElement ? (
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Selection ID</Label>
                                            <div className="p-2 bg-slate-50 border rounded text-[10px] font-mono break-all line-clamp-1">
                                                {selectedElement.id}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground underline decoration-blue-500/30">Standard Dimensions (meters)</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] text-slate-500">Width (m)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        className="h-8 text-sm"
                                                        value={selectedElement.widthMeters}
                                                        onChange={(e) => handleUpdateItem(selectedElement.id, { widthMeters: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] text-slate-500">Height (m)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        className="h-8 text-sm"
                                                        value={selectedElement.heightMeters}
                                                        onChange={(e) => handleUpdateItem(selectedElement.id, { heightMeters: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground underline decoration-blue-500/30">Orientation</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] text-slate-500">Rotation (°)</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-8 text-sm"
                                                        value={selectedElement.rotation}
                                                        onChange={(e) => handleUpdateItem(selectedElement.id, { rotation: Number(e.target.value) % 360 })}
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button variant="outline" size="sm" className="w-full h-8 gap-2" onClick={() => handleRotate(selectedElement.id)}>
                                                        <RotateCw className="w-3 h-3 text-blue-500" /> +90°
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Label / Tag</Label>
                                            <Input
                                                type="text"
                                                className="h-8 text-sm"
                                                value={selectedElement.label || ""}
                                                onChange={(e) => handleUpdateItem(selectedElement.id, { label: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 pt-4">
                                            <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={() => handleRotate(selectedElement.id)}>
                                                <RotateCw className="w-4 h-4 text-blue-500" /> Rotate 90°
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full gap-2 justify-start text-destructive hover:bg-destructive/10" onClick={() => handleDeleteItem(selectedElement.id)}>
                                                <Trash2 className="w-4 h-4" /> Remove Item
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                                        <Settings2 className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-sm">No element selected</p>
                                        <p className="text-[10px] opacity-70 mt-1">Select an item to view properties</p>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Floor Name</Label>
                                        <Input
                                            type="text"
                                            className="h-8 text-sm"
                                            value={layout.name}
                                            onChange={(e) => setLayout(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground underline decoration-blue-500/30">Canvas Bounds (meters)</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-slate-500">Width (m)</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8 text-sm"
                                                    value={layout.widthMeters}
                                                    onChange={(e) => setLayout(prev => ({ ...prev, widthMeters: Number(e.target.value) }))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-slate-500">Height (m)</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8 text-sm"
                                                    value={layout.heightMeters}
                                                    onChange={(e) => setLayout(prev => ({ ...prev, heightMeters: Number(e.target.value) }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50 rounded-lg space-y-2 border border-blue-100">
                                        <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tight">Pro Tip</p>
                                        <p className="text-[10px] text-blue-600 leading-relaxed shadow-sm">
                                            Hold <b>Shift</b> while scrolling with your mouse wheel to zoom in and out of the canvas.
                                            Items are now <b>constrained</b> to the floor area.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
