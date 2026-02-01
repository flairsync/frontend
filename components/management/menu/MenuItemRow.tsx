import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { Button } from "@/components/ui/button";
import { Edit, ImageIcon, Plus, Trash } from "lucide-react";

type MenuItemRowProps = {
    item: {
        id: string;
        name: string;
        description?: string | null;
        price: number;
    };
    categoryId: string;

    onEdit: (item: any) => void;
    onDelete: (itemId: string) => void;
    // NEW
    onDuplicate: (item: any) => void; // duplicate button
};

export const MenuItemRow = ({
    item,
    categoryId,
    onEdit,
    onDelete,
    onDuplicate
}: MenuItemRowProps) => {
    return (
        <div
            className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg
                 border border-zinc-200 dark:border-zinc-700 hover:shadow-sm transition"
        >

            <div className="flex flex-col">
                <p className="font-medium text-zinc-800 dark:text-zinc-100">
                    {item.name}
                </p>
                {item.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {item.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.price}
                </span>

                <ConfirmAction
                    onConfirm={() => onDelete(item.id)}
                    title="Delete item?"
                    description={`This will permanently delete "${item.name}".`}
                    storageKey="menu-item-delete-confirm"
                >
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </ConfirmAction>

                <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => onEdit(item)}
                >
                    <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => onDuplicate(item)}
                >
                    <Plus className="h-4 w-4" /> Duplicate
                </Button>
            </div>
        </div>
    );
};
