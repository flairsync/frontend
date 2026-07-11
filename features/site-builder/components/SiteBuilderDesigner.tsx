import React, { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPONENT_REGISTRY, PropFieldSchema } from "../registry";
import { LINK_PRESET_OPTIONS } from "../linkPresets";
import SiteBuilderCanvas from "./SiteBuilderCanvas";
import ComponentPickerModal from "./ComponentPickerModal";
import NavLinksEditor from "./NavLinksEditor";
import { SitePageContent, SiteComponentInstance, SiteSection } from "../types";

interface SiteBuilderDesignerProps {
    content: SitePageContent;
    onContentChange: (content: SitePageContent) => void;
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`);

const defaultPropsFor = (schema?: PropFieldSchema[]) =>
    Object.fromEntries((schema || []).filter((f) => f.defaultValue !== undefined).map((f) => [f.key, f.defaultValue]));

const SiteBuilderDesigner: React.FC<SiteBuilderDesignerProps> = ({ content, onContentChange }) => {
    const sections = content.sections || [];
    const [selected, setSelected] = useState<{ sectionId: string; componentId: string } | null>(null);
    const [pickerSectionId, setPickerSectionId] = useState<string | null>(null);

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

    const handleRenameSection = (sectionId: string, name: string) => {
        onContentChange({ sections: sections.map((s) => (s.id === sectionId ? { ...s, name } : s)) });
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

    const handleSelectComponentType = (typeKey: string) => {
        const targetSectionId = pickerSectionId;
        setPickerSectionId(null);
        if (!targetSectionId) return;

        const entry = COMPONENT_REGISTRY[typeKey];
        if (!entry) return;

        const instance: SiteComponentInstance = {
            id: newId(),
            typeKey,
            order: 0,
            props: defaultPropsFor(entry.propsSchema),
            bindings: entry.defaultBindings ? { ...entry.defaultBindings } : undefined,
        };

        const newSections = sections.map((s) => {
            if (s.id !== targetSectionId) return s;
            const insertedComponents = [...s.components, instance].map((c, i) => ({ ...c, order: i }));
            return { ...s, components: insertedComponents };
        });

        onContentChange({ sections: newSections });
        setSelected({ sectionId: targetSectionId, componentId: instance.id });
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
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

    const selectedSchema = selectedInstance ? COMPONENT_REGISTRY[selectedInstance.typeKey]?.propsSchema : undefined;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
                {/* Canvas */}
                <div className="space-y-6" onClick={() => setSelected(null)}>
                    <SiteBuilderCanvas
                        sections={sections}
                        mode="edit"
                        selectedComponentId={selected?.componentId}
                        onSelectComponent={(sectionId, componentId) => setSelected({ sectionId, componentId })}
                        onRemoveComponent={handleRemoveComponent}
                        onRemoveSection={handleRemoveSection}
                        onRenameSection={handleRenameSection}
                        onAddComponent={(sectionId) => setPickerSectionId(sectionId)}
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
                                        {field.type === "image" && (
                                            <Input value={value} onChange={(e) => handlePropChange(field.key, e.target.value)} placeholder="https://.../image.jpg" />
                                        )}
                                        {field.type === "linkPreset" && (
                                            <div className="space-y-2">
                                                <Select
                                                    value={LINK_PRESET_OPTIONS.some((o) => o.value === value) ? value : "custom"}
                                                    onValueChange={(v) => handlePropChange(field.key, v === "custom" ? "" : v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LINK_PRESET_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                        ))}
                                                        <SelectItem value="custom">Custom URL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {!LINK_PRESET_OPTIONS.some((o) => o.value === value) && (
                                                    <Input
                                                        value={value}
                                                        onChange={(e) => handlePropChange(field.key, e.target.value)}
                                                        placeholder="https://"
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {field.type === "navLinks" && (
                                            <NavLinksEditor
                                                value={value || []}
                                                onChange={(links) => handlePropChange(field.key, links)}
                                                sections={sections}
                                            />
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

            <ComponentPickerModal
                open={pickerSectionId !== null}
                onOpenChange={(open) => !open && setPickerSectionId(null)}
                onSelect={handleSelectComponentType}
            />
        </DndContext>
    );
};

export default SiteBuilderDesigner;
