import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveComponent } from "../registry";
import { SiteSection, SiteComponentInstance } from "../types";

interface SiteBuilderCanvasProps {
    sections: SiteSection[];
    mode: "edit" | "public";
    resolvedBindings?: Record<string, Record<string, any>>;
    selectedComponentId?: string | null;
    onSelectComponent?: (sectionId: string, componentId: string) => void;
    onRemoveComponent?: (sectionId: string, componentId: string) => void;
    onRemoveSection?: (sectionId: string) => void;
    onRenameSection?: (sectionId: string, name: string) => void;
    onAddComponent?: (sectionId: string) => void;
}

const renderComponentInstance = (
    instance: SiteComponentInstance,
    resolvedBindings: Record<string, Record<string, any>> | undefined,
    mode: "edit" | "public"
) => {
    const { Component, resolvedTypeKey, mapProps } = resolveComponent(instance.typeKey);
    const isUnresolved = resolvedTypeKey === "fallback@1" && instance.typeKey !== "fallback@1";

    if (isUnresolved && mode === "public") {
        console.warn(`[site-builder] Unresolvable component typeKey "${instance.typeKey}" — skipped on public page`);
        return null;
    }

    const raw = { ...instance.props, ...(resolvedBindings?.[instance.id] || {}) };
    const mergedProps = mapProps(raw);

    return (
        <Component
            {...mergedProps}
            editing={mode === "edit"}
            unresolvedTypeKey={isUnresolved ? instance.typeKey : undefined}
        />
    );
};

const ComponentShell: React.FC<{
    instance: SiteComponentInstance;
    sectionId: string;
    mode: "edit" | "public";
    resolvedBindings?: Record<string, Record<string, any>>;
    selected?: boolean;
    onSelect?: () => void;
    onRemove?: () => void;
}> = ({ instance, sectionId, mode, resolvedBindings, selected, onSelect, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: instance.id,
        data: { type: "component", sectionId },
        disabled: mode !== "edit",
    });

    const content = renderComponentInstance(instance, resolvedBindings, mode);

    if (mode === "public") {
        return content ? <div key={instance.id}>{content}</div> : null;
    }

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={cn(
                "relative group rounded-xl border-2 transition-colors",
                selected ? "border-primary" : "border-transparent hover:border-primary/30"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
            }}
        >
            <div className="absolute -left-9 top-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    {...listeners}
                    {...attributes}
                    className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={14} />
                </button>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                }}
                className="absolute -right-2 -top-2 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
                <X size={12} />
            </button>
            <div className="pointer-events-none">
                <div className="pointer-events-auto">{content}</div>
            </div>
        </div>
    );
};

const SectionShell: React.FC<{
    section: SiteSection;
    sectionIndex: number;
    mode: "edit" | "public";
    resolvedBindings?: Record<string, Record<string, any>>;
    selectedComponentId?: string | null;
    onSelectComponent?: (componentId: string) => void;
    onRemoveComponent?: (componentId: string) => void;
    onRemoveSection?: () => void;
    onRenameSection?: (name: string) => void;
    onAddComponent?: () => void;
}> = ({
    section,
    sectionIndex,
    mode,
    resolvedBindings,
    selectedComponentId,
    onSelectComponent,
    onRemoveComponent,
    onRemoveSection,
    onRenameSection,
    onAddComponent,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: section.id,
        data: { type: "section" },
        disabled: mode !== "edit",
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `section-drop:${section.id}`,
        data: { type: "section-drop", sectionId: section.id },
        disabled: mode !== "edit",
    });

    const components = [...section.components].sort((a, b) => a.order - b.order);

    if (mode === "public") {
        return (
            <div id={`section-${section.id}`} className="space-y-8">
                {components.map((c) => (
                    <React.Fragment key={c.id}>{renderComponentInstance(c, resolvedBindings, mode)}</React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
            className="relative rounded-2xl border border-dashed border-border/60 p-6 pl-10 space-y-6 bg-card/40"
        >
            <div className="absolute left-2 top-2 flex items-center gap-2">
                <button
                    {...listeners}
                    {...attributes}
                    className="w-6 h-10 rounded-lg bg-muted border border-border flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={14} />
                </button>
            </div>

            <div className="flex items-center justify-between gap-3 pl-8 pr-24">
                <input
                    value={section.name || ""}
                    onChange={(e) => onRenameSection?.(e.target.value)}
                    placeholder={`Section ${sectionIndex + 1}`}
                    className="bg-transparent text-sm font-semibold text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:text-foreground border-b border-transparent focus:border-primary/40 py-0.5"
                />
                <button
                    onClick={onAddComponent}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Component
                </button>
            </div>

            <button
                onClick={onRemoveSection}
                className="absolute right-3 top-3 text-xs text-destructive/70 hover:text-destructive font-medium"
            >
                Remove section
            </button>

            <div ref={setDropRef} className={cn("space-y-6 min-h-[80px] rounded-xl", isOver && "ring-2 ring-primary/40 bg-primary/5")}>
                <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {components.length > 0 ? (
                        components.map((c) => (
                            <ComponentShell
                                key={c.id}
                                instance={c}
                                sectionId={section.id}
                                mode={mode}
                                resolvedBindings={resolvedBindings}
                                selected={selectedComponentId === c.id}
                                onSelect={() => onSelectComponent?.(c.id)}
                                onRemove={() => onRemoveComponent?.(c.id)}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic py-4 text-center">
                            Click "Add Component" above to get started.
                        </p>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

const SiteBuilderCanvas: React.FC<SiteBuilderCanvasProps> = ({
    sections,
    mode,
    resolvedBindings,
    selectedComponentId,
    onSelectComponent,
    onRemoveComponent,
    onRemoveSection,
    onRenameSection,
    onAddComponent,
}) => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);

    if (mode === "public") {
        return (
            <div className="space-y-24">
                {sorted.map((section, i) => (
                    <SectionShell key={section.id} section={section} sectionIndex={i} mode={mode} resolvedBindings={resolvedBindings} />
                ))}
            </div>
        );
    }

    return (
        <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-8">
                {sorted.map((section, sectionIndex) => (
                    <SectionShell
                        key={section.id}
                        sectionIndex={sectionIndex}
                        section={section}
                        mode={mode}
                        resolvedBindings={resolvedBindings}
                        selectedComponentId={selectedComponentId}
                        onSelectComponent={(componentId) => onSelectComponent?.(section.id, componentId)}
                        onRemoveComponent={(componentId) => onRemoveComponent?.(section.id, componentId)}
                        onRemoveSection={() => onRemoveSection?.(section.id)}
                        onRenameSection={(name) => onRenameSection?.(section.id, name)}
                        onAddComponent={() => onAddComponent?.(section.id)}
                    />
                ))}
            </div>
        </SortableContext>
    );
};

export default SiteBuilderCanvas;
