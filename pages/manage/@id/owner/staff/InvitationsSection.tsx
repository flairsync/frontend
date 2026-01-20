import { useBusinessEmpInvitations } from '@/features/business/employment/useBusinessEmpInvitations'
import React, { useState } from 'react'
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

import { Trash, UserPlus, Edit, Plus, MoreHorizontal, Clock, Check, X, Slash, Hourglass } from "lucide-react";
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


const InvitationsSection = () => {
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const [invitationQrValue, setInvitationQrValue] = useState<string>();
    const [cancelInvitationId, setCancelInvitationId] = useState<string>()
    const [filterStatus, setFilterStatus] = useState<string>('ALL'); // Example filter
    const {
        routeParams
    } = usePageContext();

    const {
        invitations,
        currentPage,
        isFetching,
        isPending,
        setPage,
        totalPages
    } = useBusinessEmpInvitations(routeParams.id);

    const {
        inviteNewEmployee,
        invitingNewEmployee
    } = useBusinessEmployeeOps(routeParams.id);

    const {
        resendInvitation,
        resendingInvitation,
        cancelInvitation,
        cancelingInvitation
    } = useBusinessEmployeeOps(routeParams.id);

    const handleGenerateQrValue = (invite: BusinessEmployeeInvitation) => {
        setInvitationQrValue(invite.token);
    }

    const handleFilterChange = (status: string) => {
        setFilterStatus(status);
        // TODO: Send request to backend to fetch filtered data
        // fetchInvitations({ status, page: currentPage });
    }

    return (
        <div>
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
                description='Please scan this QR code from the staff "FlairSync Staff" mobile app'
            />

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle>All Staff Invitations</CardTitle>


                    <div className="flex gap-2">
                        <div className="flex justify-end">
                            <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                                <DialogTrigger asChild >
                                    <Button className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" /> Add Staff
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Staff</DialogTitle>
                                    </DialogHeader>

                                    <Formik
                                        initialValues={{ email: '', }}
                                        validationSchema={inviteNewEmployeeSchema}
                                        onSubmit={values => {
                                            inviteNewEmployee(values.email)
                                            setInviteModalOpen(false);
                                        }}
                                    >
                                        {({ errors, touched, handleChange, values }) => (
                                            <Form className="space-y-4 mt-2">
                                                <Input
                                                    placeholder="Email"
                                                    value={values.email}
                                                    name="email"
                                                    id="email"
                                                    onChange={handleChange}
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                                <Button type="submit" >Add</Button>
                                            </Form>)}
                                    </Formik>

                                </DialogContent>
                            </Dialog>

                        </div>
                        {/* Example filter dropdown */}
                        <Select value={filterStatus} onValueChange={(value) => handleFilterChange(value)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="DECLINED">Declined</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </CardHeader>

                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Display name</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Retries</TableHead>
                                <TableHead>Actions</TableHead>
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => resendInvitation(invite.id)}>
                                                    Resend email
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleGenerateQrValue(invite)}>
                                                    Show QR code
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setCancelInvitationId(invite.id)}>
                                                    Cancel invitation
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                            Previous
                        </Button>
                        <span className="px-2 py-1 border rounded">{currentPage} / {totalPages}</span>
                        <Button
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default InvitationsSection

// Status cell component
const StatusCell = ({ status }: { status: string }) => {
    let icon, text, color;

    switch (status) {
        case "PENDING":
            icon = <Clock className="w-4 h-4 mr-1" />;
            text = "Pending";
            color = "text-yellow-500";
            break;
        case "ACCEPTED":
            icon = <Check className="w-4 h-4 mr-1" />;
            text = "Accepted";
            color = "text-green-500";
            break;
        case "DECLINED":
            icon = <X className="w-4 h-4 mr-1" />;
            text = "Declined";
            color = "text-red-500";
            break;
        case "CANCELLED":
            icon = <Slash className="w-4 h-4 mr-1" />;
            text = "Cancelled";
            color = "text-gray-500";
            break;
        case "EXPIRED":
            icon = <Hourglass className="w-4 h-4 mr-1" />;
            text = "Expired";
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
