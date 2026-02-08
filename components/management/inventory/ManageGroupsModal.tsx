import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { InventoryGroup } from "@/models/inventory/InventoryGroup";

interface ManageGroupsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: InventoryGroup[] | undefined;
    onCreateGroup: (name: string) => Promise<void>;
    onUpdateGroup: (groupId: string, name: string) => Promise<void>;
    onDeleteGroup: (groupId: string) => Promise<void>;
    isProcessing: boolean;
}

export const ManageGroupsModal: React.FC<ManageGroupsModalProps> = ({
    open,
    onOpenChange,
    groups,
    onCreateGroup,
    onUpdateGroup,
    onDeleteGroup,
    isProcessing
}) => {
    const { t } = useTranslation();
    const [groupName, setGroupName] = useState("");
    const [editingGroup, setEditingGroup] = useState<InventoryGroup | null>(null);

    const handleSubmit = async () => {
        if (!groupName) return;
        try {
            if (editingGroup) {
                await onUpdateGroup(editingGroup.id, groupName);
            } else {
                await onCreateGroup(groupName);
            }
            setGroupName("");
            setEditingGroup(null);
            // Don't close modal automatically to allow multiple adds/edits? 
            // Original code: setGroupModalOpen(false) was ONLY for Create/Update? 
            // Let's check original code behavior. It closed the modal: setGroupModalOpen(false);
            // Use callback props if we want parent to control, but here we can keep state local mostly.
            // Actually, keep it open usually for management? 
            // Original code: closed on save.
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Original code closed the modal on save. Maybe we should keep it open for "Manage"?
    // "Manage Groups" implies doing multiple things. 
    // Usually "Add" closes, "Manage" stays open.
    // Let's re-read the original code:
    /*
    const handleCreateGroup = async () => {
        if (!groupName) return;
        try {
            if (editingGroup) {
                await updateGroup({ groupId: editingGroup.id, data: { name: groupName } });
            } else {
                await createGroup({ name: groupName });
            }
            setGroupName("");
            setEditingGroup(null);
            setGroupModalOpen(false); // It closes!
        } ...
    */
    // If it closes, we should probably replicate that.

    const handleEditGroup = (group: InventoryGroup) => {
        setEditingGroup(group);
        setGroupName(group.name);
    };

    const handleCancelEdit = () => {
        setEditingGroup(null);
        setGroupName("");
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                handleCancelEdit();
            }
            onOpenChange(val);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("inventory_management.manage_groups")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder={editingGroup ? t("inventory_management.edit_group") : t("inventory_management.add_group")}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Button onClick={handleSubmit} disabled={isProcessing}>
                            {editingGroup ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {editingGroup ? (
                            <div className="p-4 text-center text-muted-foreground border rounded-md bg-gray-50 dark:bg-gray-900">
                                {t("inventory_management.edit_group_mode") || "Updating group..."}
                            </div>
                        ) : (
                            groups?.map(group => (
                                <div key={group.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <span>{group.name}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditGroup(group)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteGroup(group.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <DialogFooter>
                    {editingGroup && (
                        <Button variant="ghost" onClick={handleCancelEdit}>
                            {t("shared.actions.cancel")}
                        </Button>
                    )}
                    <Button onClick={handleSubmit} disabled={isProcessing}>
                        {editingGroup ? t("shared.actions.save") : t("shared.actions.add")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
