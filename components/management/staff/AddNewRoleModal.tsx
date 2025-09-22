
import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Permission = {
    id: string;
    label: string;
};

const permissions: Permission[] = [
    { id: "manage-staff", label: "Manage Staff" },
    { id: "manage-roles", label: "Manage Roles" },
    { id: "view-reports", label: "View Reports" },
    { id: "edit-settings", label: "Edit Settings" },
    // add more to test scrolling
];

export function AddRoleModal() {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const togglePermission = (id: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        console.log({
            roleName,
            description,
            permissions: selectedPermissions,
        });
        // TODO: send to backend + close dialog if needed
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Role</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add New Role</DialogTitle>
                    <DialogDescription>
                        Create a new role and assign permissions.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <div>
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input
                            id="roleName"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="e.g. Manager"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description of this role"
                        />
                    </div>

                    <div>
                        <Label>Permissions</Label>
                        <div className="grid gap-2 mt-2">
                            {permissions.map((perm) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={perm.id}
                                        checked={selectedPermissions.includes(perm.id)}
                                        onCheckedChange={() => togglePermission(perm.id)}
                                    />
                                    <Label htmlFor={perm.id}>{perm.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky footer */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
