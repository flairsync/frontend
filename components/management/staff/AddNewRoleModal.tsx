import { useFormik } from "formik";
import * as Yup from "yup";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { usePlatformPermissions } from "@/features/shared/usePlatformPermissions";
import { Loader, Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Role } from "@/models/business/roles/Role";
import { RoleSchema } from "@/misc/FormValidators";

type Props = {
    open?: boolean;
    onAdd: (data: {
        name: string;
        permissions: any[];
        editId?: string;
    }) => void;
    onOpenChange: (open: boolean) => void;
    editRole?: Role;
};

export function AddRoleModal(props: Props) {
    const { t } = useTranslation();
    const { loadingPermissionsList, permissionsList } =
        usePlatformPermissions();

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: props.editRole?.name ?? "",
            permissions:
                props.editRole?.permissions.map(p => ({
                    permissionId: p.permission.id,
                    key: p.permission.key,
                    flags: {
                        canRead: p.canRead,
                        canCreate: p.canCreate,
                        canUpdate: p.canUpdate,
                        canDelete: p.canDelete,
                    },
                })) ?? [],
        },
        validationSchema: RoleSchema,
        onSubmit: values => {
            props.onAdd({
                ...values,
                editId: props.editRole?.id,
            });
        },
    });

    /** 🔹 Add permission */
    const addPermission = (perm: any) => {
        if (
            formik.values.permissions.some(
                p => p.permissionId === perm.id
            )
        )
            return;

        formik.setFieldValue("permissions", [
            ...formik.values.permissions,
            {
                permissionId: perm.id,
                key: perm.key,
                flags: {
                    canRead: true,
                    canCreate: false,
                    canUpdate: false,
                    canDelete: false,
                },
            },
        ]);
    };

    /** 🔹 Toggle permission flag */
    const updateFlag = (
        permissionId: string,
        flag: string,
        value: boolean
    ) => {
        formik.setFieldValue(
            "permissions",
            formik.values.permissions.map(p =>
                p.permissionId === permissionId
                    ? { ...p, flags: { ...p.flags, [flag]: value } }
                    : p
            )
        );
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={open => {
                props.onOpenChange(open);

                // ✅ Reset form when modal closes
                if (!open) {
                    formik.resetForm();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button>{props.editRole ? "Edit Role" : "Add Role"}</Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {props.editRole ? "Edit Role" : "Add New Role"}
                    </DialogTitle>
                    <DialogDescription>
                        {props.editRole
                            ? "Update role name and permissions."
                            : "Create a new role and assign permissions."}
                    </DialogDescription>
                </DialogHeader>

                {loadingPermissionsList ? (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin" />
                    </div>
                ) : (
                    <form
                        onSubmit={formik.handleSubmit}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                            {/* Role name */}
                            <div>
                                <Label>Role Name</Label>
                                <Input
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="e.g. Manager"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {formik.errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Permission selector */}
                            <div>
                                <Label>Add Permission</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                        >
                                            Select permission
                                            <Plus className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search permission..." />
                                            <CommandEmpty>No permission found.</CommandEmpty>
                                            <CommandGroup>
                                                {permissionsList?.map(perm => (
                                                    <CommandItem
                                                        key={perm.id}
                                                        onSelect={() => addPermission(perm)}
                                                    >
                                                        {t(`permissions.${perm.key}.label`)}
                                                        {formik.values.permissions.some(
                                                            p => p.permissionId === perm.id
                                                        ) && (
                                                                <Check className="ml-auto h-4 w-4" />
                                                            )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                {formik.errors.permissions && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {formik.errors.permissions as string}
                                    </p>
                                )}
                            </div>

                            {/* Permissions table */}
                            {formik.values.permissions.length > 0 && (
                                <div className="space-y-3">
                                    <Label>Assigned Permissions</Label>
                                    <div className="border rounded-md divide-y">
                                        {formik.values.permissions.map(p => (
                                            <div
                                                key={p.permissionId}
                                                className="flex justify-between p-3"
                                            >
                                                <span className="font-medium">
                                                    {t(`permissions.${p.key}.label`)}
                                                </span>
                                                <div className="flex gap-4">
                                                    {(
                                                        ["canRead", "canCreate", "canUpdate", "canDelete"] as const
                                                    ).map(flag => (
                                                        <div
                                                            key={flag}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Checkbox
                                                                checked={p.flags[flag]}
                                                                onCheckedChange={v =>
                                                                    updateFlag(
                                                                        p.permissionId,
                                                                        flag,
                                                                        Boolean(v)
                                                                    )
                                                                }
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
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit">
                                {props.editRole ? "Update" : "Save"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
