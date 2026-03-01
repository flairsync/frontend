import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Role } from "@/models/business/roles/Role";

type Props = {
    open: boolean;
    role?: Role;
    onOpenChange: (open: boolean) => void;
};

export function ViewRoleModal({ open, role, onOpenChange }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>View Role: {role?.name}</DialogTitle>
                    <DialogDescription>
                        Permissions assigned to this role.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {role?.permissions && role.permissions.length > 0 ? (
                        <div className="space-y-3">
                            <Label>Assigned Permissions</Label>
                            <div className="border rounded-md divide-y">
                                {role.permissions.map((p) => (
                                    <div
                                        key={p.permission.id}
                                        className="flex justify-between p-3"
                                    >
                                        <span className="font-medium">
                                            {t(`permissions.${p.permission.key}.label`)}
                                        </span>
                                        <div className="flex gap-4">
                                            {(
                                                ["canRead", "canCreate", "canUpdate", "canDelete"] as const
                                            ).map((flag) => (
                                                <div
                                                    key={flag}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Checkbox
                                                        checked={p[flag]}
                                                        disabled
                                                    />
                                                    <span className="text-sm">
                                                        {flag.replace("can", "")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No permissions assigned.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
