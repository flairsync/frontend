import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Copy } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";

type Props = {
    item: any;
    category: BusinessMenuCategory;
    categories: BusinessMenuCategory[];
    setCategories: (cats: BusinessMenuCategory[]) => void;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
};

export const MenuItemRowSortable = ({
    item,
    category,
    onEdit,
    onDelete,
    onDuplicate
}: Props) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id,
        data: { type: "item", name: item.name },
    });

    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-sm transition">
            {/* DRAG HANDLE */}
            <div {...listeners} {...attributes} className="w-6 h-10 bg-zinc-200 dark:bg-zinc-700 mr-2 rounded flex items-center justify-center cursor-grab">
                <svg className="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4h2v2H7V4zm4 0h2v2h-2V4zM7 8h2v2H7V8zm4 0h2v2h-2V8z" />
                </svg>
            </div>

            <div className="flex-1 flex justify-between items-center">
                <div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-100">{item.name}</p>
                    {item.description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.price}</span>
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
