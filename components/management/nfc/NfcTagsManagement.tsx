import React, { useState } from "react";
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

const ACTION_LABELS: Record<NfcTagActionType, string> = {
    attendance_clock_in_out: "Attendance Clock In/Out",
    pos_login: "POS Login",
};

const POS_ACCESS_MODE_LABELS: Record<NfcTagPosAccessMode, string> = {
    basic: "Basic",
    full: "Full",
};

function getActionDisplay(tag: NfcTag): string {
    if (!tag.actionType) return "None";
    if (tag.actionType === "pos_login" && tag.posAccessMode) {
        return `${ACTION_LABELS.pos_login} (${POS_ACCESS_MODE_LABELS[tag.posAccessMode]})`;
    }
    return ACTION_LABELS[tag.actionType];
}

const REQUEST_REASON_LABELS: Record<NfcCardRequestReason, string> = {
    new_staff_card: "New Staff Card",
    lost_replacement: "Lost Replacement",
    other: "Other",
};

function getAssignedStaffName(tag: NfcTag): string {
    if (!tag.assignedEmploymentId) return "Unassigned";
    const profile = tag.assignedEmployment?.professionalProfile;
    if (!profile) return "Unassigned";
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return name || profile.email || "Unassigned";
}

// ─── Assign Card Modal ───────────────────────────────────────────────────────

type AssignCardModalProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    businessId: string;
    tag: NfcTag | null;
};

function AssignCardModal({ open, onOpenChange, businessId, tag }: AssignCardModalProps) {
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
                    <DialogTitle>Assign Card</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Staff Member</Label>
                        <Select value={assignedEmploymentId} onValueChange={setAssignedEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a staff member" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {!loadingBusinessEmployees && businessEmployees?.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.professionalProfile?.getDisplayName() ?? "Unnamed"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Action</Label>
                        <Select
                            value={actionType}
                            onValueChange={setActionType}
                            disabled={assignedEmploymentId === "none"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="attendance_clock_in_out">Attendance Clock In/Out</SelectItem>
                                <SelectItem value="pos_login">POS Login</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {actionType === "pos_login" && (
                        <div className="space-y-2">
                            <Label>POS Access Mode</Label>
                            <Select
                                value={posAccessMode}
                                onValueChange={(v) => setPosAccessMode(v as NfcTagPosAccessMode)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">Basic — order-taking only, no voids/refunds/discounts</SelectItem>
                                    <SelectItem value="full">Full — same access as PIN login</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
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
                    <AlertDialogTitle>Report Card Lost or Stolen</AlertDialogTitle>
                    <AlertDialogDescription>
                        This immediately deactivates the card. A replacement request will be created automatically.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Select value={reason} onValueChange={(v) => setReason(v as NfcTagSelfRevokeReason)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lost">Lost</SelectItem>
                                <SelectItem value="stolen">Stolen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Note (optional)</Label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any additional details…" />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSelfRevokingNfcTag}>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isSelfRevokingNfcTag}>
                        {isSelfRevokingNfcTag && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Deactivate Card
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
                    <CardTitle>Cards</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-semibold">Card ID</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Assigned Staff</TableHead>
                                        <TableHead className="font-semibold">Action</TableHead>
                                        <TableHead className="font-semibold">Linked At</TableHead>
                                        {hasActionsColumn && <TableHead className="text-right font-semibold">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingNfcTags && !nfcTags ? (
                                        <TableRow>
                                            <TableCell colSpan={hasActionsColumn ? 6 : 5} className="text-center py-10 text-muted-foreground animate-pulse">
                                                Loading cards…
                                            </TableCell>
                                        </TableRow>
                                    ) : !nfcTags || nfcTags.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={hasActionsColumn ? 6 : 5} className="text-center py-10 text-muted-foreground">
                                                No cards found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nfcTags.map((tag) => (
                                            <TableRow key={tag.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-mono text-xs">{tag.id.slice(0, 8)}…</TableCell>
                                                <TableCell>
                                                    <Badge variant={tag.status === "linked" ? "default" : tag.status === "revoked" ? "destructive" : "outline"}>
                                                        {tag.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getAssignedStaffName(tag)}</TableCell>
                                                <TableCell>{getActionDisplay(tag)}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {tag.linkedAt ? tag.linkedAt.toLocaleDateString() : "—"}
                                                </TableCell>
                                                {hasActionsColumn && (
                                                    <TableCell className="text-right">
                                                        {tag.status === "linked" ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleOpenAssign(tag)}>
                                                                    <UserCog className="h-4 w-4 mr-1" /> Assign
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleOpenReport(tag)}>
                                                                    <ShieldAlert className="h-4 w-4 mr-1" /> Report Lost/Stolen
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
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <span className="text-sm font-medium">{pagination.current} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                                Next <ChevronRight className="h-4 w-4 ml-2" />
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
                    <DialogTitle>Request a New Card</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Select value={reason} onValueChange={(v) => setReason(v as NfcCardRequestReason)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new_staff_card">New Staff Card</SelectItem>
                                <SelectItem value="lost_replacement">Lost Replacement</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Note (optional)</Label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any additional details…" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isCreatingNfcCardRequest}>
                        {isCreatingNfcCardRequest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
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
    const [page, setPage] = useState(1);
    const { nfcCardRequests, pagination, fetchingNfcCardRequests } = useNfcCardRequests(businessId, { page });
    const [requestModalOpen, setRequestModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            {canCreate && (
                <div className="flex justify-end">
                    <Button onClick={() => setRequestModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Request a new card
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Card Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-semibold">Reason</TableHead>
                                        <TableHead className="font-semibold">Note</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Requested At</TableHead>
                                        <TableHead className="font-semibold">Resolution Note</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingNfcCardRequests && !nfcCardRequests ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground animate-pulse">
                                                Loading requests…
                                            </TableCell>
                                        </TableRow>
                                    ) : !nfcCardRequests || nfcCardRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                No requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nfcCardRequests.map((req) => (
                                            <TableRow key={req.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell>{REQUEST_REASON_LABELS[req.reason]}</TableCell>
                                                <TableCell className="text-muted-foreground">{req.note || "—"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={req.status === "fulfilled" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                                                        {req.status}
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
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <span className="text-sm font-medium">{pagination.current} / {pagination.pages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                                Next <ChevronRight className="h-4 w-4 ml-2" />
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
    const [activeTab, setActiveTab] = useState("cards");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
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
