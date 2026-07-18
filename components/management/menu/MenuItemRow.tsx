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
            className="flex justify-between items-center p-3 bg-muted rounded-lg
                 border border-border hover:shadow-sm transition"
        >

            <div className="flex flex-col">
                <p className="font-medium text-foreground">
                    {item.name}
                </p>
                {item.description && (
                    <p className="text-sm text-muted-foreground">
                        {item.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">
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
