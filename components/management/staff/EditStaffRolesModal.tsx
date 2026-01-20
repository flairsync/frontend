import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Plus, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Role } from "@/models/business/roles/Role";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";

type Props = {
    staff: BusinessEmployee
    open: boolean;
    roles: Role[] | undefined;
    onOpenChange: (open: boolean) => void;
    onSave?: (roleIds: string[]) => void;
};

export function EditStaffRolesModal({
    staff,
    open,
    roles,
    onOpenChange,
    onSave,
}: Props) {
    const { t } = useTranslation();

    /** 🔹 Editable role IDs */
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    /** 🔹 Init from staff on open */
    useEffect(() => {
        if (open) {
            setSelectedRoleIds(staff.roles.map(r => r.role.id));
        }
    }, [open, staff.roles]);

    /** 🔹 Derived roles */
    const assignedRoles = useMemo(
        () => roles?.filter(r => selectedRoleIds.includes(r.id)) ?? [],
        [roles, selectedRoleIds]
    );

    const availableRoles = useMemo(
        () => roles?.filter(r => !selectedRoleIds.includes(r.id)) ?? [],
        [roles, selectedRoleIds]
    );

    /** 🔹 Add role */
    const addRole = (roleId: string) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev : [...prev, roleId]
        );
    };

    /** 🔹 Remove role */
    const removeRole = (roleId: string) => {
        setSelectedRoleIds(prev => prev.filter(id => id !== roleId));
    };

    /** 🔹 Save */
    const handleSave = () => {
        onSave?.(selectedRoleIds);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Staff Roles</DialogTitle>
                </DialogHeader>

                {/* Staff summary */}
                <div className="border rounded-lg p-4 space-y-1">
                    <p className="font-medium">{staff.professionalProfile?.displayName}</p>
                    <p className="text-sm text-muted-foreground">{staff.professionalProfile?.workEmail}</p>
                    <Badge variant="outline">{staff.status}</Badge>
                </div>

                {/* Add role dropdown */}
                <div className="mt-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                                disabled={!availableRoles.length}
                            >
                                Add role
                                <Plus className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0 max-h-60 overflow-auto">
                            <Command>
                                <CommandInput placeholder="Search role..." />
                                <CommandEmpty>No role found.</CommandEmpty>
                                <CommandGroup>
                                    {availableRoles.map(role => (
                                        <CommandItem key={role.id} onSelect={() => addRole(role.id)}>
                                            {role.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Scrollable list of assigned roles */}
                <ScrollArea className="flex-1 mt-4 pr-3">
                    <div className="space-y-6">
                        {assignedRoles.map(role => (
                            <div key={role.id} className="border rounded-lg p-4 space-y-3">
                                {/* Role header with remove button */}
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{role.name}</h4>
                                    <Button size="icon" variant="ghost" onClick={() => removeRole(role.id)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>

                                {/* Permissions (read-only) */}
                                <div className="space-y-2">
                                    {role.permissions.map(p => (
                                        <div key={p.permission.id} className="flex justify-between items-center text-sm">
                                            <span>{t(`permissions.${p.permission.key}.label`)}</span>
                                            <div className="flex gap-3">
                                                {(["canRead", "canCreate", "canUpdate", "canDelete"] as const).map(flag => (
                                                    <div key={flag} className="flex items-center gap-1">
                                                        <Checkbox checked={p[flag]} disabled />
                                                        <span className="text-xs">{flag.replace("can", "")}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {!assignedRoles.length && (
                            <p className="text-sm text-muted-foreground">No roles assigned.</p>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
