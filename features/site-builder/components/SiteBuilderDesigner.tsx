import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    useDraggable,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPONENT_REGISTRY, PropFieldSchema } from "../registry";
import SiteBuilderCanvas from "./SiteBuilderCanvas";
import { SitePageContent, SiteComponentInstance, SiteSection } from "../types";

interface SiteBuilderDesignerProps {
    content: SitePageContent;
    onContentChange: (content: SitePageContent) => void;
}

const PaletteItem: React.FC<{ typeKey: string; label: string }> = ({ typeKey, label }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette:${typeKey}`,
        data: { type: "palette-item", typeKey },
    });

    return (
        <button
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-grab active:cursor-grabbing text-sm font-medium"
            style={{ opacity: isDragging ? 0.4 : 1 }}
        >
            {label}
        </button>
    );
};

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`);

const defaultPropsFor = (schema?: PropFieldSchema[]) =>
    Object.fromEntries((schema || []).filter((f) => f.defaultValue !== undefined).map((f) => [f.key, f.defaultValue]));

const SiteBuilderDesigner: React.FC<SiteBuilderDesignerProps> = ({ content, onContentChange }) => {
    const sections = content.sections || [];
    const [selected, setSelected] = useState<{ sectionId: string; componentId: string } | null>(null);
    const [activeDrag, setActiveDrag] = useState<any>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const selectedInstance: SiteComponentInstance | undefined = selected
        ? sections.find((s) => s.id === selected.sectionId)?.components.find((c) => c.id === selected.componentId)
        : undefined;

    const handleAddSection = () => {
        const section: SiteSection = { id: newId(), order: sections.length, components: [] };
        onContentChange({ sections: [...sections, section] });
    };

    const handleRemoveSection = (sectionId: string) => {
        if (selected?.sectionId === sectionId) setSelected(null);
        const remaining = sections.filter((s) => s.id !== sectionId).map((s, i) => ({ ...s, order: i }));
        onContentChange({ sections: remaining });
    };

    const handleRemoveComponent = (sectionId: string, componentId: string) => {
        if (selected?.componentId === componentId) setSelected(null);
        const newSections = sections.map((s) =>
            s.id === sectionId
                ? { ...s, components: s.components.filter((c) => c.id !== componentId).map((c, i) => ({ ...c, order: i })) }
                : s
        );
        onContentChange({ sections: newSections });
    };

    const handlePropChange = (key: string, value: any) => {
        if (!selected) return;
        const newSections = sections.map((s) => {
            if (s.id !== selected.sectionId) return s;
            return {
                ...s,
                components: s.components.map((c) =>
                    c.id === selected.componentId ? { ...c, props: { ...c.props, [key]: value } } : c
                ),
            };
        });
        onContentChange({ sections: newSections });
    };

    const handleDragStart = (event: DragStartEvent) => setActiveDrag(event.active.data.current);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDrag(null);
        if (!over) return;

        const activeData: any = active.data.current;
        const overData: any = over.data.current;

        // Reordering sections
        if (activeData?.type === "section" && overData?.type === "section") {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
                onContentChange({ sections: reordered });
            }
            return;
        }

        // Dragging a new component in from the palette
        if (activeData?.type === "palette-item") {
            const targetSectionId: string | undefined =
                overData?.type === "section-drop" ? overData.sectionId :
                overData?.type === "component" ? overData.sectionId :
                overData?.type === "section" ? (over.id as string) :
                undefined;
            if (!targetSectionId) return;

            const entry = COMPONENT_REGISTRY[activeData.typeKey];
            if (!entry) return;

            const instance: SiteComponentInstance = {
                id: newId(),
                typeKey: activeData.typeKey,
                order: 0,
                props: defaultPropsFor(entry.propsSchema),
            };

            const newSections = sections.map((s) => {
                if (s.id !== targetSectionId) return s;
                const components = [...s.components];
                const insertIndex = overData?.type === "component"
                    ? components.findIndex((c) => c.id === over.id)
                    : components.length;
                components.splice(insertIndex < 0 ? components.length : insertIndex, 0, instance);
                return { ...s, components: components.map((c, i) => ({ ...c, order: i })) };
            });

            onContentChange({ sections: newSections });
            setSelected({ sectionId: targetSectionId, componentId: instance.id });
            return;
        }

        // Reordering / moving an existing component
        if (activeData?.type === "component") {
            const sourceSectionId: string = activeData.sectionId;
            const destSectionId: string =
                overData?.type === "component" ? overData.sectionId :
                overData?.type === "section-drop" ? overData.sectionId :
                overData?.type === "section" ? (over.id as string) :
                sourceSectionId;

            const sourceSection = sections.find((s) => s.id === sourceSectionId);
            const destSection = sections.find((s) => s.id === destSectionId);
            if (!sourceSection || !destSection) return;

            const item = sourceSection.components.find((c) => c.id === active.id);
            if (!item) return;

            if (sourceSectionId === destSectionId) {
                const oldIndex = sourceSection.components.findIndex((c) => c.id === active.id);
                const newIndex = overData?.type === "component"
                    ? destSection.components.findIndex((c) => c.id === over.id)
                    : destSection.components.length - 1;
                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
                const reordered = arrayMove(sourceSection.components, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
                onContentChange({ sections: sections.map((s) => (s.id === sourceSectionId ? { ...s, components: reordered } : s)) });
            } else {
                const newSourceComponents = sourceSection.components.filter((c) => c.id !== item.id).map((c, i) => ({ ...c, order: i }));
                const destComponents = [...destSection.components];
                const insertIndex = overData?.type === "component" ? destComponents.findIndex((c) => c.id === over.id) : destComponents.length;
                destComponents.splice(insertIndex < 0 ? destComponents.length : insertIndex, 0, item);
                const newDestComponents = destComponents.map((c, i) => ({ ...c, order: i }));

                onContentChange({
                    sections: sections.map((s) => {
                        if (s.id === sourceSectionId) return { ...s, components: newSourceComponents };
                        if (s.id === destSectionId) return { ...s, components: newDestComponents };
                        return s;
                    }),
                });
            }
        }
    };

    const paletteEntries = Object.entries(COMPONENT_REGISTRY).filter(
        ([key, entry]) => key !== "fallback@1" && !entry.deprecated && entry.label
    );

    const selectedSchema = selectedInstance ? COMPONENT_REGISTRY[selectedInstance.typeKey]?.propsSchema : undefined;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-[220px_1fr_280px] gap-6 items-start">
                {/* Palette */}
                <div className="space-y-3 sticky top-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Components</h3>
                    <div className="space-y-2">
                        {paletteEntries.map(([key, entry]) => (
                            <PaletteItem key={key} typeKey={key} label={entry.label!} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="space-y-6" onClick={() => setSelected(null)}>
                    <SiteBuilderCanvas
                        sections={sections}
                        mode="edit"
                        selectedComponentId={selected?.componentId}
                        onSelectComponent={(sectionId, componentId) => setSelected({ sectionId, componentId })}
                        onRemoveComponent={handleRemoveComponent}
                        onRemoveSection={handleRemoveSection}
                    />
                    <Button variant="outline" className="w-full gap-2" onClick={handleAddSection}>
                        <Plus className="w-4 h-4" /> Add Section
                    </Button>
                </div>

                {/* Prop editor */}
                <div className="sticky top-4">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {selectedInstance ? COMPONENT_REGISTRY[selectedInstance.typeKey]?.label || "Component" : "Properties"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!selectedInstance && (
                                <p className="text-sm text-muted-foreground">Select a component on the canvas to edit its properties.</p>
                            )}
                            {selectedInstance && (!selectedSchema || selectedSchema.length === 0) && (
                                <p className="text-sm text-muted-foreground">This component has no editable properties.</p>
                            )}
                            {selectedInstance && selectedSchema?.map((field) => {
                                const value = selectedInstance.props?.[field.key] ?? field.defaultValue ?? "";
                                return (
                                    <div key={field.key} className="space-y-1.5">
                                        <Label className="text-xs">{field.label}</Label>
                                        {field.type === "text" && (
                                            <Input value={value} onChange={(e) => handlePropChange(field.key, e.target.value)} />
                                        )}
                                        {field.type === "url" && (
                                            <Input value={value} onChange={(e) => handlePropChange(field.key, e.target.value)} placeholder="https://" />
                                        )}
                                        {field.type === "textarea" && (
                                            <Textarea value={value} onChange={(e) => handlePropChange(field.key, e.target.value)} rows={3} />
                                        )}
                                        {field.type === "number" && (
                                            <Input
                                                type="number"
                                                value={value}
                                                onChange={(e) => handlePropChange(field.key, Number(e.target.value))}
                                            />
                                        )}
                                        {field.type === "color" && (
                                            <input
                                                type="color"
                                                value={value || "#000000"}
                                                onChange={(e) => handlePropChange(field.key, e.target.value)}
                                                className="w-full h-9 rounded-lg border border-border cursor-pointer"
                                            />
                                        )}
                                        {field.type === "boolean" && (
                                            <Switch checked={!!value} onCheckedChange={(v) => handlePropChange(field.key, v)} />
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <DragOverlay>
                {activeDrag?.type === "palette-item" ? (
                    <div className="px-4 py-3 rounded-xl border border-primary bg-card shadow-lg text-sm font-medium">
                        {COMPONENT_REGISTRY[activeDrag.typeKey]?.label}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default SiteBuilderDesigner;
