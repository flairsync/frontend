import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash, UserPlus, Edit, Plus } from "lucide-react";
import { AddRoleModal } from "@/components/management/staff/AddNewRoleModal";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { usePlatformPermissions } from "@/features/shared/usePlatformPermissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Role } from "@/models/business/roles/Role";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";

const RolesSection = () => {

    const {
        routeParams
    } = usePageContext();

    const {
        businessRoles,
        loadingBusinessRoles,
        createNewRole,
        creatingNewRole
    } = useBusinessRoles(routeParams.id);


    // Roles
    const [roleModal, setRoleModal] = useState(false);
    const [editRole, setEditRole] = useState<Role>();

    return (
        <div>

            <div className="flex justify-end">
                <AddRoleModal
                    open={roleModal}
                    onOpenChange={(open) => {
                        setRoleModal(open);
                        if (!open) {
                            setEditRole(undefined);
                        }
                    }}
                    editRole={editRole}
                    onAdd={(data) => {
                        createNewRole({
                            name: data.name,
                            permissions: data.permissions.map(val => {
                                return {
                                    permissionKey: val.key,
                                    canCreate: val.flags.canCreate,
                                    canDelete: val.flags.canDelete,
                                    canRead: val.flags.canRead,
                                    canUpdate: val.flags.canUpdate
                                }
                            })
                        })
                        setRoleModal(false);
                        setEditRole(undefined);

                    }}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Employees</TableHead>
                                    <TableHead>Permission</TableHead>
                                    <TableHead className="text-center">Read</TableHead>
                                    <TableHead className="text-center">Create</TableHead>
                                    <TableHead className="text-center">Update</TableHead>
                                    <TableHead className="text-center">Delete</TableHead>
                                    <TableHead className="sticky right-0 bg-white z-10">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {businessRoles?.map((role) => (
                                    <>
                                        {role.permissions.map((p, idx) => (
                                            <TableRow key={`${role.id}-${p.permission.id}`}>
                                                {/* Role name only in the first permission row */}
                                                <TableCell className="align-top">
                                                    {idx === 0 ? role.name : ""}
                                                </TableCell>
                                                <TableCell>
                                                    <Button>{role.employeeCount} Emps.
                                                        <Edit />
                                                    </Button>
                                                </TableCell>
                                                {/* Permission label */}
                                                <TableCell>{p.permission.label}</TableCell>

                                                {/* Checkboxes for flags */}
                                                <TableCell className="text-center">
                                                    <Checkbox checked={p.canRead} disabled />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Checkbox checked={p.canCreate} disabled />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Checkbox checked={p.canUpdate} disabled />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Checkbox checked={p.canDelete} disabled />
                                                </TableCell>

                                                {/* Edit button only in the first permission row */}
                                                {idx === 0 && (
                                                    <TableCell className="sticky right-0 bg-white z-10 text-right">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditRole(role);
                                                                setRoleModal(true);
                                                            }}
                                                        //   onClick={() => handleEditRole(role)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

export default RolesSection