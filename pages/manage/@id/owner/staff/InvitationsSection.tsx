import { useBusinessEmpInvitations } from '@/features/business/employment/useBusinessEmpInvitations'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageContext } from 'vike-react/usePageContext';

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

import { Trash, UserPlus, Edit, Plus, MoreHorizontal, Clock, Check, X, Slash, Hourglass, FileSpreadsheet } from "lucide-react";
import { StaffCsvImportModal } from "@/components/management/staff/StaffCsvImportModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useBusinessEmployeeOps } from '@/features/business/employment/useBusinessEmployeeOps';
import { QrcodePopup } from '@/components/shared/QrcodePopup';
import { BusinessEmployeeInvitation } from '@/models/business/BusinessEmployeeInvitation';
import { ConfirmationPopup } from '@/components/shared/ConfirmationPopup';
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, Formik } from "formik";
import { inviteNewEmployeeSchema } from "@/misc/FormValidators";
import { InputError } from "@/components/inputs/InputError";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessPlan } from '@/features/business/useBusinessPlan';
import { useSubscriptionStore } from '@/features/subscriptions/SubscriptionStore';
import { cn } from '@/lib/utils';


type InvitationsSectionProps = {
    canCreate?: boolean;
};

const InvitationsSection = ({ canCreate = true }: InvitationsSectionProps) => {
    const { t } = useTranslation("management");
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);

    const { openUpgradeModal } = useSubscriptionStore();
    const { routeParams } = usePageContext();

    const { plan } = useBusinessPlan(routeParams.id);
    const canAddEmployee = plan ? plan.canAddEmployee : true;

    const [invitationQrValue, setInvitationQrValue] = useState<string>();
    const [cancelInvitationId, setCancelInvitationId] = useState<string>()
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const {
        invitations,
        currentPage,
        isFetching,
        isPending,
        setPage,
        totalPages
    } = useBusinessEmpInvitations(routeParams.id, filterStatus);

    const {
        inviteNewEmployee,
        invitingNewEmployee
    } = useBusinessEmployeeOps(routeParams.id);

    const {
        resendInvitation,
        resendingInvitation,
        cancelInvitation,
        cancelingInvitation,
        parseStaffCsv,
        parsingStaffCsv,
        importStaffCsv,
        importingStaffCsv,
    } = useBusinessEmployeeOps(routeParams.id);

    const handleGenerateQrValue = (invite: BusinessEmployeeInvitation) => {
        setInvitationQrValue(invite.token);
    }

    const handleFilterChange = (status: string) => {
        setFilterStatus(status);
    }

    return (
        <div>
            {/* Global UpgradeModal handles this */}
            <ConfirmationPopup
                isOpen={cancelInvitationId != undefined}
                onCancel={() => setCancelInvitationId(undefined)}
                onConfirm={() => {
                    cancelInvitation(cancelInvitationId!);
                    setCancelInvitationId(undefined);
                }}
                variant='danger'
            />

            <QrcodePopup
                qrValue={invitationQrValue}
                onClose={() => setInvitationQrValue(undefined)}
                description={t("invitations_section.qr_description")}
            />

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle>{t("invitations_section.title")}</CardTitle>


                    <div className="flex gap-2">
                        <div className="flex justify-end">
                            {canCreate && <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                                <DialogTrigger asChild >
                                    <Button
                                        className={cn(
                                            "flex items-center gap-2 transition",
                                            canAddEmployee
                                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200"
                                        )}
                                        onClick={(e) => {
                                            if (!canAddEmployee) {
                                                e.preventDefault();
                                                openUpgradeModal(
                                                    plan
                                                        ? t("invitations_section.upgrade_prompt_with_limit", { allowed: plan.allowed.employees, current: plan.current.employees })
                                                        : t("invitations_section.upgrade_prompt_generic")
                                                );
                                            }
                                        }}
                                    >
                                        <UserPlus className="h-4 w-4" /> {t("invitations_section.add_staff")}
                                        {!canAddEmployee && <span className="text-[10px] font-bold text-indigo-600 uppercase ml-1">{t("invitations_section.upgrade")}</span>}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t("invitations_section.add_new_staff_title")}</DialogTitle>
                                    </DialogHeader>

                                    <Formik
                                        initialValues={{ email: '', }}
                                        validationSchema={inviteNewEmployeeSchema}
                                        onSubmit={values => {
                                            inviteNewEmployee(values.email, {
                                                onError: (err: any) => {
                                                    // Global interceptor handles this
                                                }
                                            });
                                            setInviteModalOpen(false);
                                        }}
                                    >
                                        {({ errors, touched, handleChange, values }) => (
                                            <Form className="space-y-4 mt-2">
                                                <Input
                                                    placeholder={t("invitations_section.email_placeholder")}
                                                    value={values.email}
                                                    name="email"
                                                    id="email"
                                                    onChange={handleChange}
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                                <Button type="submit" >{t("invitations_section.add")}</Button>
                                            </Form>)}
                                    </Formik>

                                </DialogContent>
                            </Dialog>}

                            {canCreate && (
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 ml-2"
                                    onClick={() => setCsvImportModalOpen(true)}
                                >
                                    <FileSpreadsheet className="h-4 w-4" /> {t("invitations_section.import_csv")}
                                </Button>
                            )}
                        </div>
                        <Select value={filterStatus} onValueChange={(value) => handleFilterChange(value)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t("invitations_section.status_filter_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t("invitations_section.status_options.ALL")}</SelectItem>
                                <SelectItem value="PENDING">{t("invitations_section.status_options.PENDING")}</SelectItem>
                                <SelectItem value="ACCEPTED">{t("invitations_section.status_options.ACCEPTED")}</SelectItem>
                                <SelectItem value="DECLINED">{t("invitations_section.status_options.DECLINED")}</SelectItem>
                                <SelectItem value="CANCELLED">{t("invitations_section.status_options.CANCELLED")}</SelectItem>
                                <SelectItem value="EXPIRED">{t("invitations_section.status_options.EXPIRED")}</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </CardHeader>

                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("invitations_section.col_email")}</TableHead>
                                <TableHead>{t("invitations_section.col_display_name")}</TableHead>
                                <TableHead>{t("invitations_section.col_created")}</TableHead>
                                <TableHead>{t("invitations_section.col_expires")}</TableHead>
                                <TableHead>{t("invitations_section.col_status")}</TableHead>
                                <TableHead>{t("invitations_section.col_retries")}</TableHead>
                                <TableHead>{t("invitations_section.col_actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invitations?.map((invite) => (
                                <TableRow key={invite.id}>
                                    <TableCell>{invite.email}</TableCell>
                                    <TableCell>{invite.professional?.displayName}</TableCell>
                                    <TableCell>{invite.getCreatedAtDate()}</TableCell>
                                    <TableCell>{invite.getExpiryDate()}</TableCell>
                                    <TableCell>
                                        <StatusCell status={invite.status} />
                                    </TableCell>
                                    <TableCell>{invite.resendCount}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {invite.status !== 'ACCEPTED' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">{t("invitations_section.open_menu")}</span>
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t("invitations_section.col_actions")}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => resendInvitation(invite.id)}>
                                                        {t("invitations_section.resend_email")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleGenerateQrValue(invite)}>
                                                        {t("invitations_section.show_qr")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setCancelInvitationId(invite.id)}>
                                                        {t("invitations_section.cancel_invitation")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex justify-end mt-4 gap-2">
                        <Button
                            disabled={currentPage <= 1}
                            onClick={() => setPage(currentPage - 1)}
                        >
                            {t("invitations_section.previous")}
                        </Button>
                        <span className="px-2 py-1 border rounded">{currentPage} / {totalPages}</span>
                        <Button
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            {t("invitations_section.next")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <StaffCsvImportModal
                businessId={routeParams.id}
                open={csvImportModalOpen}
                onClose={() => setCsvImportModalOpen(false)}
                isParsing={parsingStaffCsv}
                isImporting={importingStaffCsv}
                onParse={parseStaffCsv}
                onImport={importStaffCsv}
            />
        </div>
    )
}

export default InvitationsSection

// Status cell component
const StatusCell = ({ status }: { status: string }) => {
    const { t } = useTranslation("management");
    let icon, text, color;

    switch (status) {
        case "PENDING":
            icon = <Clock className="w-4 h-4 mr-1" />;
            text = t("invitations_section.status_options.PENDING");
            color = "text-yellow-500";
            break;
        case "ACCEPTED":
            icon = <Check className="w-4 h-4 mr-1" />;
            text = t("invitations_section.status_options.ACCEPTED");
            color = "text-green-500";
            break;
        case "DECLINED":
            icon = <X className="w-4 h-4 mr-1" />;
            text = t("invitations_section.status_options.DECLINED");
            color = "text-red-500";
            break;
        case "CANCELLED":
            icon = <Slash className="w-4 h-4 mr-1" />;
            text = t("invitations_section.status_options.CANCELLED");
            color = "text-gray-500";
            break;
        case "EXPIRED":
            icon = <Hourglass className="w-4 h-4 mr-1" />;
            text = t("invitations_section.status_options.EXPIRED");
            color = "text-orange-500";
            break;
        default:
            icon = null;
            text = status;
            color = "text-gray-500";
    }

    return (
        <div className={`flex items-center ${color} font-medium`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};
