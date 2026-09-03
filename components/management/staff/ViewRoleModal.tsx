import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Role } from "@/models/business/roles/Role";
import { getRequiredByKeys } from "@/features/business/roles/permissionDependencies";

type Props = {
    open: boolean;
    role?: Role;
    onOpenChange: (open: boolean) => void;
};

export function ViewRoleModal({ open, role, onOpenChange }: Props) {
    const { t } = useTranslation("management");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t("view_role_modal.title", { name: role?.name })}</DialogTitle>
                    <DialogDescription>
                        {t("view_role_modal.description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {role?.permissions && role.permissions.length > 0 ? (
                        <div className="space-y-3">
                            <Label>{t("add_role_modal.assigned_permissions")}</Label>
                            <div className="border rounded-md divide-y">
                                {role.permissions.map((p) => {
                                    const requiredBy = getRequiredByKeys(
                                        p.permission.key,
                                        role.permissions.map(perm => ({
                                            key: perm.permission.key,
                                            canRead: perm.canRead,
                                            canCreate: perm.canCreate,
                                            canUpdate: perm.canUpdate,
                                            canDelete: perm.canDelete,
                                        }))
                                    );

                                    return (
                                    <div
                                        key={p.permission.id}
                                        className="flex justify-between p-3"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {t(`permissions.${p.permission.key}.label`)}
                                            </span>
                                            {requiredBy.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    {t("add_role_modal.permission_required_by", {
                                                        permissions: requiredBy
                                                            .map(key => t(`permissions.${key}.label`))
                                                            .join(", "),
                                                    })}
                                                </p>
                                            )}
                                        </div>
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
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t("view_role_modal.no_permissions_assigned")}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
