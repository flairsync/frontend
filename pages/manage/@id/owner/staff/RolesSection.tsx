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
import { ViewRoleModal } from "@/components/management/staff/ViewRoleModal";
import { BatchEditRoleEmployeesModal } from "@/components/management/staff/BatchEditRoleEmployeesModal";
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
        creatingNewRole,
        updateRole,
        deleteRole
    } = useBusinessRoles(routeParams.id);


    // Roles
    const [roleModal, setRoleModal] = useState(false);
    const [editRole, setEditRole] = useState<Role>();
    const [viewRoleModal, setViewRoleModal] = useState(false);
    const [viewRole, setViewRole] = useState<Role>();
    const [batchEditRoleModal, setBatchEditRoleModal] = useState(false);
    const [batchEditRole, setBatchEditRole] = useState<Role>();


    return (
        <div>



            <Card>
                <CardHeader
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                >
                    <CardTitle>Roles</CardTitle>
                    <div className="flex gap-2">
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
                                    const payload = {
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
                                    }

                                    if (data.editId) {
                                        updateRole({
                                            roleId: data.editId,
                                            data: payload
                                        })
                                    } else {
                                        createNewRole(payload)
                                    }

                                    setRoleModal(false);
                                    setEditRole(undefined);

                                }}
                            />
                            <ViewRoleModal
                                open={viewRoleModal}
                                onOpenChange={setViewRoleModal}
                                role={viewRole}
                            />
                            <BatchEditRoleEmployeesModal
                                open={batchEditRoleModal}
                                onOpenChange={setBatchEditRoleModal}
                                role={batchEditRole}
                                businessId={routeParams.id}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Employees</TableHead>
                                    <TableHead className="text-center">Permissions</TableHead>
                                    <TableHead className="sticky right-0 bg-white z-10 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {businessRoles?.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onDoubleClick={() => {
                                            setViewRole(role);
                                            setViewRoleModal(true);
                                        }}
                                    >
                                        <TableCell className="font-medium align-middle">
                                            {role.name}
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    // Stop propagation to avoid triggering the row's onDoubleClick
                                                    e.stopPropagation();
                                                    setBatchEditRole(role);
                                                    setBatchEditRoleModal(true);
                                                }}
                                            >
                                                {role.employeeCount} Emps.
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center align-middle">
                                            {role.permissions.length} Permissions
                                        </TableCell>
                                        <TableCell className="sticky right-0 bg-white z-10 text-right align-middle">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditRole(role);
                                                        setRoleModal(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
                                                            deleteRole(role.id)
                                                        }
                                                    }}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
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