import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pin, Plus, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/auth/usePermissions";
import {
    PinnableItem,
    getOwnerPinnableItems,
    getStaffPinnableItems,
} from "@/features/dashboard/pinnedLinks/pinnableItems";
import {
    useAddPinnedLink,
    usePinnedLinks,
    useRemovePinnedLink,
    useReorderPinnedLinks,
} from "@/features/dashboard/pinnedLinks/usePinnedLinks";
import { PinnedLink } from "@/models/PinnedLink";

const MAX_PINS = 12;

type Props = {
    businessId: string;
    role: "owner" | "staff";
};

function PinnedLinkChip({
    pin,
    item,
    businessId,
    onRemove,
}: {
    pin: PinnedLink;
    item: PinnableItem;
    businessId: string;
    onRemove: () => void;
}) {
    const { t } = useTranslation("management");
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: pin.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-1 rounded-full border bg-background pl-1 pr-2 py-1 text-sm",
                isDragging && "opacity-50",
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab rounded-full p-1 text-muted-foreground hover:text-foreground"
                aria-label={t("pinned_links.drag_handle")}
            >
                <GripVertical className="h-3.5 w-3.5" />
            </button>
            <a href={`/manage/${businessId}/${item.path}`} className="flex items-center gap-1.5 hover:underline">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                {t(item.titleKey)}
            </a>
            <button
                onClick={onRemove}
                className="ml-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                aria-label={t("pinned_links.remove")}
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}

export function PinnedLinksWidget({ businessId, role }: Props) {
    const { t } = useTranslation("management");
    const { pinnedLinks, loadingPinnedLinks } = usePinnedLinks(businessId);
    const { addPinnedLink, addingPinnedLink } = useAddPinnedLink(businessId);
    const { removePinnedLink } = useRemovePinnedLink(businessId);
    const { reorderPinnedLinks } = useReorderPinnedLinks(businessId);
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(
        role === "staff" ? businessId : undefined,
    );

    const catalog: PinnableItem[] =
        role === "owner" ? getOwnerPinnableItems() : getStaffPinnableItems(hasPermission);
    const catalogByPath = new Map(catalog.map((item) => [item.path, item]));

    const [orderedPins, setOrderedPins] = useState<PinnedLink[]>([]);
    useEffect(() => {
        setOrderedPins(pinnedLinks);
    }, [pinnedLinks]);

    const [popoverOpen, setPopoverOpen] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = orderedPins.findIndex((p) => p.id === active.id);
        const newIndex = orderedPins.findIndex((p) => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(orderedPins, oldIndex, newIndex);
        setOrderedPins(newOrder);
        reorderPinnedLinks(newOrder.map((pin, index) => ({ id: pin.id, order: index })));
    };

    const isLoading = loadingPinnedLinks || (role === "staff" && loadingPermissions);
    const pinnedPaths = new Set(orderedPins.map((p) => p.path));
    const availableItems = catalog.filter((item) => !pinnedPaths.has(item.path));
    const atMax = orderedPins.length >= MAX_PINS;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Pin className="h-4 w-4 text-muted-foreground" />
                    {t("pinned_links.title")}
                </CardTitle>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" disabled={atMax || isLoading}>
                            <Plus className="h-4 w-4" />
                            {t("pinned_links.add")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-2">
                        {atMax ? (
                            <p className="p-2 text-sm text-muted-foreground">{t("pinned_links.max_reached")}</p>
                        ) : availableItems.length === 0 ? (
                            <p className="p-2 text-sm text-muted-foreground">{t("pinned_links.nothing_to_add")}</p>
                        ) : (
                            <div className="flex max-h-64 flex-col overflow-y-auto">
                                {availableItems.map((item) => (
                                    <button
                                        key={item.path}
                                        disabled={addingPinnedLink}
                                        onClick={() => {
                                            addPinnedLink(item.path);
                                            setPopoverOpen(false);
                                        }}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
                                    >
                                        <item.icon className="h-4 w-4 text-muted-foreground" />
                                        {t(item.titleKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : orderedPins.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("pinned_links.empty_state")}</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={orderedPins.map((p) => p.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            <div className="flex flex-wrap gap-2">
                                {orderedPins.map((pin) => {
                                    const item = catalogByPath.get(pin.path);
                                    if (!item) return null;
                                    return (
                                        <PinnedLinkChip
                                            key={pin.id}
                                            pin={pin}
                                            item={item}
                                            businessId={businessId}
                                            onRemove={() => removePinnedLink(pin.id)}
                                        />
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </CardContent>
        </Card>
    );
}
