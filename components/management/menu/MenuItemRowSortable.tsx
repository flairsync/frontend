import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Copy } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { AuditLogHint } from "@/components/audit/AuditLogHint";
import { useBusinessBasicDetails } from "@/features/business/useBusinessBasicDetails";
import { getCurrencySymbol } from "@/utils/currency";

type Props = {
    item: any;
    category: BusinessMenuCategory;
    categories: BusinessMenuCategory[];
    setCategories: (cats: BusinessMenuCategory[]) => void;
    businessId?: string;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
};

export const MenuItemRowSortable = ({
    item,
    category,
    businessId,
    onEdit,
    onDelete,
    onDuplicate
}: Props) => {
    const { businessBasicDetails } = useBusinessBasicDetails(businessId ?? null);
    const currencySymbol = getCurrencySymbol(businessBasicDetails?.currency);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id,
        data: { type: "item", name: item.name },
    });

    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex p-3 bg-muted rounded-lg border border-border hover:shadow-sm transition">
            {/* DRAG HANDLE */}
            <div {...listeners} {...attributes} className="w-6 h-10 bg-muted mr-2 rounded flex items-center justify-center cursor-grab">
                <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4h2v2H7V4zm4 0h2v2h-2V4zM7 8h2v2H7V8zm4 0h2v2h-2V8z" />
                </svg>
            </div>

            <div className="flex-1 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-1">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <AuditLogHint entityType="menu_item" entityId={item.id} businessId={businessId} />
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{currencySymbol}{item.price}</span>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                    >
                        <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                        }}
                    >
                        <Copy className="h-4 w-4" /> Duplicate
                    </Button>
                </div>
            </div>
        </div>
    );
};
