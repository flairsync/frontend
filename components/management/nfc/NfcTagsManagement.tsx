import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Loader2, Plus, ShieldAlert, UserCog } from "lucide-react";

import {
    useNfcTags,
    useNfcCardRequests,
    useAssignNfcTagEmployment,
    useAssignNfcTagAction,
    useSelfRevokeNfcTag,
    useCreateNfcCardRequest,
} from "@/features/nfc/useNfc";
import { useBusinessEmployment } from "@/features/business/employment/useBusinessEmployment";
import { NfcTag } from "@/models/nfc/NfcTag";
import {
    NfcTagActionType,
    NfcTagPosAccessMode,
    NfcTagSelfRevokeReason,
    NfcCardRequestReason,
} from "@/features/nfc/service";

type NfcTagsManagementProps = {
    businessId: string;
    canCreate: boolean;
    canUpdate: boolean;
};

function getActionLabels(t: (key: string) => string): Record<NfcTagActionType, string> {
    return {
        attendance_clock_in_out: t("nfc_tags_management.action_labels.attendance_clock_in_out"),
        pos_login: t("nfc_tags_management.action_labels.pos_login"),
    };
}

function getPosAccessModeLabels(t: (key: string) => string): Record<NfcTagPosAccessMode, string> {
    return {
        basic: t("nfc_tags_management.pos_access_mode_labels.basic"),
        full: t("nfc_tags_management.pos_access_mode_labels.full"),
    };
}

function getActionDisplay(t: (key: string) => string, tag: NfcTag): string {
    if (!tag.actionType) return t("nfc_tags_management.action_labels.none");
    const actionLabels = getActionLabels(t);
    if (tag.actionType === "pos_login" && tag.posAccessMode) {
        return `${actionLabels.pos_login} (${getPosAccessModeLabels(t)[tag.posAccessMode]})`;
    }
    return actionLabels[tag.actionType];
}

function getRequestReasonLabels(t: (key: string) => string): Record<NfcCardRequestReason, string> {
    return {
        new_staff_card: t("nfc_tags_management.request_reason_labels.new_staff_card"),
        lost_replacement: t("nfc_tags_management.request_reason_labels.lost_replacement"),
        other: t("nfc_tags_management.request_reason_labels.other"),
    };
}

function getAssignedStaffName(t: (key: string) => string, tag: NfcTag): string {
    const unassigned = t("nfc_tags_management.unassigned");
    if (!tag.assignedEmploymentId) return unassigned;
    const profile = tag.assignedEmployment?.professionalProfile;
    if (!profile) return unassigned;
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return name || profile.email || unassigned;
}

// ─── Assign Card Modal ───────────────────────────────────────────────────────

type AssignCardModalProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    businessId: string;
    tag: NfcTag | null;
};

function AssignCardModal({ open, onOpenChange, businessId, tag }: AssignCardModalProps) {
    const { t } = useTranslation("management");
    const { businessEmployees, loadingBusinessEmployees } = useBusinessEmployment(businessId);
    const { assignNfcTagEmployment, isAssigningNfcTagEmployment } = useAssignNfcTagEmployment(businessId);
    const { assignNfcTagAction, isAssigningNfcTagAction } = useAssignNfcTagAction(businessId);

    const [assignedEmploymentId, setAssignedEmploymentId] = useState<string>("none");
    const [actionType, setActionType] = useState<string>("none");
    const [posAccessMode, setPosAccessMode] = useState<NfcTagPosAccessMode>("basic");

    React.useEffect(() => {
        if (tag) {
            setAssignedEmploymentId(tag.assignedEmploymentId ?? "none");
            setActionType(tag.actionType ?? "none");
            setPosAccessMode(tag.posAccessMode ?? "basic");
        }
    }, [tag]);

    const isSaving = isAssigningNfcTagEmployment || isAssigningNfcTagAction;

    const handleSave = async () => {
        if (!tag) return;

        const currentAssigned = tag.assignedEmploymentId ?? null;
        const currentAction = tag.actionType ?? null;
        const currentPosAccessMode = tag.posAccessMode ?? null;
        const nextAssigned = assignedEmploymentId === "none" ? null : assignedEmploymentId;
        const nextAction = actionType === "none" ? null : (actionType as NfcTagActionType);
        const nextPosAccessMode = nextAction === "pos_login" ? posAccessMode : null;
        const actionChanged = nextAction !== currentAction || nextPosAccessMode !== currentPosAccessMode;

        try {
            if (nextAssigned !== null) {
                // Assigning/keeping a staff member: the assignment must exist before an action can be set.
                if (nextAssigned !== currentAssigned) {
                    await assignNfcTagEmployment({ id: tag.id, assignedEmploymentId: nextAssigned });
                }
                if (actionChanged) {
                    await assignNfcTagAction({ id: tag.id, actionType: nextAction, posAccessMode: nextPosAccessMode });
                }
            } else {
                // Clearing the staff member: any action must be cleared first.
                if (actionChanged) {
                    await assignNfcTagAction({ id: tag.id, actionType: nextAction, posAccessMode: nextPosAccessMode });
                }
                if (nextAssigned !== currentAssigned) {
                    await assignNfcTagEmployment({ id: tag.id, assignedEmploymentId: nextAssigned });
                }
            }
            onOpenChange(false);
        } catch {
            // errors handled in hooks via toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("nfc_tags_management.assign_modal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("nfc_tags_management.assign_modal.staff_member_label")}</Label>
                        <Select value={assignedEmploymentId} onValueChange={setAssignedEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("nfc_tags_management.assign_modal.select_staff_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t("nfc_tags_management.unassigned")}</SelectItem>
                                {!loadingBusinessEmployees && businessEmployees?.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.getDisplayName() ?? t("nfc_tags_management.unnamed")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("nfc_tags_management.assign_modal.action_label")}</Label>
                        <Select
                            value={actionType}
                            onValueChange={setActionType}
                            disabled={assignedEmploymentId === "none"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("nfc_tags_management.assign_modal.select_action_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t("nfc_tags_management.action_labels.none")}</SelectItem>
                                <SelectItem value="attendance_clock_in_out">{t("nfc_tags_management.action_labels.attendance_clock_in_out")}</SelectItem>
                                <SelectItem value="pos_login">{t("nfc_tags_management.action_labels.pos_login")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {actionType === "pos_login" && (
                        <div className="space-y-2">
                            <Label>{t("nfc_tags_management.assign_modal.pos_access_mode_label")}</Label>
                            <Select
                                value={posAccessMode}
                                onValueChange={(v) => setPosAccessMode(v as NfcTagPosAccessMode)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">{t("nfc_tags_management.assign_modal.basic_option")}</SelectItem>
                                    <SelectItem value="full">{t("nfc_tags_management.assign_modal.full_option")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("nfc_tags_management.assign_modal.cancel")}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("nfc_tags_management.assign_modal.save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Report Lost/Stolen Alert Dialog ────────────────────────────────────────

type ReportLostStolenDialogProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    businessId: string;
    tag: NfcTag | null;
};

function ReportLostStolenDialog({ open, onOpenChange, businessId, tag }: ReportLostStolenDialogProps) {
    const { t } = useTranslation("management");
    const { selfRevokeNfcTag, isSelfRevokingNfcTag } = useSelfRevokeNfcTag(businessId);
    const [reason, setReason] = useState<NfcTagSelfRevokeReason>("lost");
    const [note, setNote] = useState("");

    React.useEffect(() => {
        if (open) {
            setReason("lost");
            setNote("");
        }
    }, [open]);

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!tag) return;
        try {
            await selfRevokeNfcTag({ id: tag.id, data: { reason, note: note || undefined } });
            onOpenChange(false);
        } catch {
            // errors handled in hook via toast
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("nfc_tags_management.report_lost_dialog.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("nfc_tags_management.report_lost_dialog.description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("nfc_tags_management.report_lost_dialog.reason_label")}</Label>
                        <Select value={reason} onValueChange={(v) => setReason(v as NfcTagSelfRevokeReason)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lost">{t("nfc_tags_management.report_lost_dialog.lost")}</SelectItem>
                                <SelectItem value="stolen">{t("nfc_tags_management.report_lost_dialog.stolen")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("nfc_tags_management.report_lost_dialog.note_label")}</Label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("nfc_tags_management.report_lost_dialog.note_placeholder")} />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSelfRevokingNfcTag}>{t("nfc_tags_management.report_lost_dialog.cancel")}</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isSelfRevokingNfcTag}>
                        {isSelfRevokingNfcTag && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("nfc_tags_management.report_lost_dialog.deactivate")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Cards Tab ───────────────────────────────────────────────────────────────

type CardsTabProps = {
    businessId: string;
    canUpdate: boolean;
};

function CardsTab({ businessId, canUpdate }: CardsTabProps) {
    const { t } = useTranslation("management");
    const [page, setPage] = useState(1);
    const { nfcTags, pagination, fetchingNfcTags } = useNfcTags(businessId, { page });

    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);

    const handleOpenAssign = (tag: NfcTag) => {
        setSelectedTag(tag);
        setAssignModalOpen(true);
    };

    const handleOpenReport = (tag: NfcTag) => {
        setSelectedTag(tag);
        setReportDialogOpen(true);
    };

    const hasActionsColumn = canUpdate;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t("nfc_tags_management.cards_tab.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.cards_tab.col_card_id")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.cards_tab.col_status")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.cards_tab.col_assigned_staff")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.cards_tab.col_action")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.cards_tab.col_linked_at")}</TableHead>
                                        {hasActionsColumn && <TableHead className="text-right font-semibold">{t("nfc_tags_management.cards_tab.col_actions")}</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingNfcTags && !nfcTags ? (
                                        <TableRow>
                                            <TableCell colSpan={hasActionsColumn ? 6 : 5} className="text-center py-10 text-muted-foreground animate-pulse">
                                                {t("nfc_tags_management.cards_tab.loading")}
                                            </TableCell>
                                        </TableRow>
                                    ) : !nfcTags || nfcTags.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={hasActionsColumn ? 6 : 5} className="text-center py-10 text-muted-foreground">
                                                {t("nfc_tags_management.cards_tab.empty")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nfcTags.map((tag) => (
                                            <TableRow key={tag.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-mono text-xs">{tag.id.slice(0, 8)}…</TableCell>
                                                <TableCell>
                                                    <Badge variant={tag.status === "linked" ? "default" : tag.status === "revoked" ? "destructive" : "outline"}>
                                                        {t(`nfc_tags_management.cards_tab.status_labels.${tag.status}`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getAssignedStaffName(t, tag)}</TableCell>
                                                <TableCell>{getActionDisplay(t, tag)}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {tag.linkedAt ? tag.linkedAt.toLocaleDateString() : "—"}
                                                </TableCell>
                                                {hasActionsColumn && (
                                                    <TableCell className="text-right">
                                                        {tag.status === "linked" ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleOpenAssign(tag)}>
                                                                    <UserCog className="h-4 w-4 mr-1" /> {t("nfc_tags_management.cards_tab.assign")}
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleOpenReport(tag)}>
                                                                    <ShieldAlert className="h-4 w-4 mr-1" /> {t("nfc_tags_management.cards_tab.report_lost_stolen")}
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground text-right">
                                                                {tag.revokedReason && <div className="capitalize">{tag.revokedReason}</div>}
                                                                {tag.revokedNote && <div>{tag.revokedNote}</div>}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                <ChevronLeft className="h-4 w-4 mr-2" /> {t("nfc_tags_management.cards_tab.previous")}
                            </Button>
                            <span className="text-sm font-medium">{pagination.current} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                                {t("nfc_tags_management.cards_tab.next")} <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AssignCardModal
                open={assignModalOpen}
                onOpenChange={setAssignModalOpen}
                businessId={businessId}
                tag={selectedTag}
            />

            <ReportLostStolenDialog
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
                businessId={businessId}
                tag={selectedTag}
            />
        </div>
    );
}

// ─── Request Card Modal ─────────────────────────────────────────────────────

type RequestCardModalProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    businessId: string;
};

function RequestCardModal({ open, onOpenChange, businessId }: RequestCardModalProps) {
    const { t } = useTranslation("management");
    const { createNfcCardRequest, isCreatingNfcCardRequest } = useCreateNfcCardRequest(businessId);
    const [reason, setReason] = useState<NfcCardRequestReason>("new_staff_card");
    const [note, setNote] = useState("");

    React.useEffect(() => {
        if (open) {
            setReason("new_staff_card");
            setNote("");
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            await createNfcCardRequest({ reason, note: note || undefined });
            onOpenChange(false);
        } catch {
            // errors handled in hook via toast
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("nfc_tags_management.request_card_modal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t("nfc_tags_management.request_card_modal.reason_label")}</Label>
                        <Select value={reason} onValueChange={(v) => setReason(v as NfcCardRequestReason)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new_staff_card">{t("nfc_tags_management.request_reason_labels.new_staff_card")}</SelectItem>
                                <SelectItem value="lost_replacement">{t("nfc_tags_management.request_reason_labels.lost_replacement")}</SelectItem>
                                <SelectItem value="other">{t("nfc_tags_management.request_reason_labels.other")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("nfc_tags_management.request_card_modal.note_label")}</Label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("nfc_tags_management.request_card_modal.note_placeholder")} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("nfc_tags_management.request_card_modal.cancel")}</Button>
                    <Button onClick={handleSubmit} disabled={isCreatingNfcCardRequest}>
                        {isCreatingNfcCardRequest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("nfc_tags_management.request_card_modal.submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Requests Tab ────────────────────────────────────────────────────────────

type RequestsTabProps = {
    businessId: string;
    canCreate: boolean;
};

function RequestsTab({ businessId, canCreate }: RequestsTabProps) {
    const { t } = useTranslation("management");
    const [page, setPage] = useState(1);
    const { nfcCardRequests, pagination, fetchingNfcCardRequests } = useNfcCardRequests(businessId, { page });
    const [requestModalOpen, setRequestModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            {canCreate && (
                <div className="flex justify-end">
                    <Button onClick={() => setRequestModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> {t("nfc_tags_management.requests_tab.request_new_card")}
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t("nfc_tags_management.requests_tab.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.requests_tab.col_reason")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.requests_tab.col_note")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.requests_tab.col_status")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.requests_tab.col_requested_at")}</TableHead>
                                        <TableHead className="font-semibold">{t("nfc_tags_management.requests_tab.col_resolution_note")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingNfcCardRequests && !nfcCardRequests ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground animate-pulse">
                                                {t("nfc_tags_management.requests_tab.loading")}
                                            </TableCell>
                                        </TableRow>
                                    ) : !nfcCardRequests || nfcCardRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                {t("nfc_tags_management.requests_tab.empty")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nfcCardRequests.map((req) => (
                                            <TableRow key={req.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell>{getRequestReasonLabels(t)[req.reason]}</TableCell>
                                                <TableCell className="text-muted-foreground">{req.note || "—"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={req.status === "fulfilled" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                                                        {t(`nfc_tags_management.requests_tab.status_labels.${req.status}`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{req.createdAt.toLocaleDateString()}</TableCell>
                                                <TableCell className="text-muted-foreground">{req.resolutionNote || "—"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                <ChevronLeft className="h-4 w-4 mr-2" /> {t("nfc_tags_management.requests_tab.previous")}
                            </Button>
                            <span className="text-sm font-medium">{pagination.current} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                                {t("nfc_tags_management.requests_tab.next")} <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <RequestCardModal
                open={requestModalOpen}
                onOpenChange={setRequestModalOpen}
                businessId={businessId}
            />
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function NfcTagsManagement({ businessId, canCreate, canUpdate }: NfcTagsManagementProps) {
    const { t } = useTranslation("management");
    const [activeTab, setActiveTab] = useState("cards");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
                <TabsTrigger value="cards">{t("nfc_tags_management.tabs.cards")}</TabsTrigger>
                <TabsTrigger value="requests">{t("nfc_tags_management.tabs.requests")}</TabsTrigger>
            </TabsList>

            <TabsContent value="cards">
                <CardsTab businessId={businessId} canUpdate={canUpdate} />
            </TabsContent>

            <TabsContent value="requests">
                <RequestsTab businessId={businessId} canCreate={canCreate} />
            </TabsContent>
        </Tabs>
    );
}
