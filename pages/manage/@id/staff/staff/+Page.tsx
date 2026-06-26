import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { usePermissions } from "@/features/auth/usePermissions";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { useBusinessEmployeeOps } from "@/features/business/employment/useBusinessEmployeeOps";
import { useMyEmployments } from "@/features/business/employment/useMyEmployments";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Loader2, Trash, Users } from "lucide-react";
import { EditStaffRolesModal } from "@/components/management/staff/EditStaffRolesModal";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import TeamsSection from "@/components/management/staff/teams/TeamsSection";
import RolesSection from "../../owner/staff/RolesSection";
import InvitationsSection from "../../owner/staff/InvitationsSection";

// ─── Bulk Assign Role Modal ──────────────────────────────────────────────────

type BulkAssignModalProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    businessId: string;
};

function BulkAssignRoleModal({ open, onOpenChange, businessId }: BulkAssignModalProps) {
    const { t } = useTranslation("management");
    const { employees } = useBusinessEmployees(businessId);
    const { businessRoles, bulkAssignRole, bulkAssigningRole } = useBusinessRoles(businessId);

    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());

    const nonOwnerEmployees = employees.filter(e => e.type !== "OWNER");

    const toggleEmp = (id: string) => {
        setSelectedEmpIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleAssign = () => {
        if (!selectedRoleId || selectedEmpIds.size === 0) return;
        bulkAssignRole(
            { roleId: selectedRoleId, employmentIds: Array.from(selectedEmpIds) },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setSelectedRoleId("");
                    setSelectedEmpIds(new Set());
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{t("staff_management_page.bulk_assign_modal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("staff_management_page.bulk_assign_modal.select_role_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                            {businessRoles?.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <ScrollArea className="border rounded-md p-2 h-64">
                        {nonOwnerEmployees.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                {t("staff_management_page.bulk_assign_modal.no_staff_found")}
                            </p>
                        ) : (
                            nonOwnerEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                                    onClick={() => toggleEmp(emp.id)}
                                >
                                    <Checkbox
                                        checked={selectedEmpIds.has(emp.id)}
                                        onCheckedChange={() => toggleEmp(emp.id)}
                                        onClick={e => e.stopPropagation()}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {emp.professionalProfile?.displayName || t("staff_management_page.bulk_assign_modal.unnamed")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {emp.professionalProfile?.workEmail}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("staff_management_page.bulk_assign_modal.cancel")}</Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedRoleId || selectedEmpIds.size === 0 || bulkAssigningRole}
                    >
                        {bulkAssigningRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("staff_management_page.bulk_assign_modal.assign_role")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Staff List Tab ──────────────────────────────────────────────────────────

type StaffTabProps = {
    canUpdate: boolean;
    canDelete: boolean;
    myEmploymentId: string | undefined;
};

function StaffTab({ canUpdate, canDelete, myEmploymentId }: StaffTabProps) {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const { employees, isPending: loadingEmployees } = useBusinessEmployees(routeParams.id);
    const { businessRoles, updateEmployeeRoles } = useBusinessRoles(routeParams.id);

    const [selectedStaff, setSelectedStaff] = useState<BusinessEmployee | null>(null);
    const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

    const hasActionsColumn = canUpdate || canDelete;

    return (
        <div className="space-y-4">
            {canUpdate && (
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setBulkAssignOpen(true)}>
                        <Users className="h-4 w-4 mr-2" />
                        {t("staff_management_page.staff_tab.bulk_assign_role")}
                    </Button>
                </div>
            )}

            {selectedStaff && (
                <EditStaffRolesModal
                    onSave={(roles) => updateEmployeeRoles({ roles, employmentId: selectedStaff.id })}
                    roles={businessRoles}
                    staff={selectedStaff}
                    open={Boolean(selectedStaff)}
                    onOpenChange={(open) => !open && setSelectedStaff(null)}
                />
            )}

            {canUpdate && (
                <BulkAssignRoleModal
                    open={bulkAssignOpen}
                    onOpenChange={setBulkAssignOpen}
                    businessId={routeParams.id}
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t("staff_management_page.staff_tab.all_staff")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("staff_management_page.staff_tab.col_name")}</TableHead>
                                <TableHead>{t("staff_management_page.staff_tab.col_status")}</TableHead>
                                <TableHead>{t("staff_management_page.staff_tab.col_roles")}</TableHead>
                                {hasActionsColumn && <TableHead>{t("staff_management_page.staff_tab.col_actions")}</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingEmployees ? (
                                <TableRow>
                                    <TableCell colSpan={hasActionsColumn ? 4 : 3} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={hasActionsColumn ? 4 : 3} className="text-center py-8 text-muted-foreground">
                                        {t("staff_management_page.staff_tab.no_staff_found")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {member.professionalProfile?.displayName ?? "—"}
                                                {member.id === myEmploymentId && (
                                                    <Badge variant="outline" className="text-xs">{t("staff_management_page.staff_tab.you_badge")}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    member.status === "ACTIVE" ? "default"
                                                    : member.status === "SUSPENDED" ? "destructive"
                                                    : "secondary"
                                                }
                                            >
                                                {t(`staff_management_page.staff_tab.status_${member.status.toLowerCase()}`, { defaultValue: member.status })}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {member.type === "OWNER" ? (
                                                <Badge className="bg-indigo-600 hover:bg-indigo-700">{t("staff_management_page.staff_tab.business_owner_badge")}</Badge>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {member.roles.length === 0 ? (
                                                        <Badge variant="secondary">{t("staff_management_page.staff_tab.no_roles_badge")}</Badge>
                                                    ) : (
                                                        <>
                                                            {member.roles.slice(0, 2).map(r => (
                                                                <Badge key={r.role.id} variant="secondary">{r.role.name}</Badge>
                                                            ))}
                                                            {member.roles.length > 2 && (
                                                                <Badge variant="outline">+{member.roles.length - 2}</Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        {hasActionsColumn && (
                                            <TableCell>
                                                {member.type !== "OWNER" && member.id !== myEmploymentId && (
                                                    <div className="flex gap-2">
                                                        {canUpdate && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                title={t("staff_management_page.staff_tab.edit_roles_title")}
                                                                onClick={() => setSelectedStaff(member)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canDelete && (
                                                            <Button size="sm" variant="destructive">
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Valid tabs ───────────────────────────────────────────────────────────────

const VALID_TABS = ["staff", "invitations", "roles", "teams"] as const;
type TabValue = typeof VALID_TABS[number];

// ─── Main Page ───────────────────────────────────────────────────────────────

const StaffManagementPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(routeParams.id);
    const { myEmployments } = useMyEmployments();
    const myEmploymentId = myEmployments?.find(e => e.business?.id === routeParams.id)?.id;

    const [activeTab, setActiveTab] = useState<TabValue>("staff");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab") as TabValue | null;
            if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized && typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", activeTab);
            window.history.replaceState({}, "", url.toString());
        }
    }, [activeTab, isInitialized]);

    if (loadingPermissions) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const canRead = hasPermission("STAFF", "read");
    const canCreate = hasPermission("STAFF", "create");
    const canUpdate = hasPermission("STAFF", "update");
    const canDelete = hasPermission("STAFF", "delete");

    if (!canRead) {
        navigate(`/manage/${routeParams.id}/staff/dashboard`);
        return null;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("staff_management_page.heading")}</h1>

            <Separator />

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
                <TabsList className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto scrollbar-none">
                    <TabsTrigger value="staff" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.tabs.staff")}
                    </TabsTrigger>
                    <TabsTrigger value="invitations" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.tabs.invitations")}
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.tabs.roles")}
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="flex-1 sm:flex-none min-w-[120px] text-center">
                        {t("staff_management_page.tabs.teams")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-6">
                    <StaffTab
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        myEmploymentId={myEmploymentId}
                    />
                </TabsContent>

                <TabsContent value="invitations" className="space-y-6">
                    <InvitationsSection canCreate={canCreate} />
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <RolesSection
                        canCreate={canCreate}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                    />
                </TabsContent>

                <TabsContent value="teams" className="space-y-6">
                    <TeamsSection
                        canCreate={canCreate}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StaffManagementPage;
