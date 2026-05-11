import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { useMyBusiness } from "@/features/business/useMyBusiness";

const OwnerDashboardPage = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id as string;

    const { myBusinessFullDetails, deleteBusiness, deletingBusiness } = useMyBusiness(businessId);

    const [openModal, setOpenModal] = useState<
        null | "shifts" | "menu" | "ownership" | "business"
    >(null);

    const [confirmText, setConfirmText] = useState("");

    const canDelete =
        myBusinessFullDetails != null &&
        !myBusinessFullDetails.isPublished &&
        (myBusinessFullDetails.counts?.employees ?? 0) === 0;

    const deleteHint = myBusinessFullDetails?.isPublished
        ? "Unpublish the business first"
        : (myBusinessFullDetails?.counts?.employees ?? 0) > 0
        ? `Remove all ${myBusinessFullDetails?.counts?.employees} staff member(s) first`
        : null;

    const handleDangerAction = (type: string) => {
        console.log(`Performing danger action: ${type}`);
        setOpenModal(null);
        setConfirmText("");
    };

    function handleDeleteBusiness() {
        deleteBusiness(undefined, {
            onSuccess: () => {
                setOpenModal(null);
                setConfirmText("");
                navigate("/manage/(global)/owned");
            },
        });
    }

    const businessNameConfirmed =
        confirmText === (myBusinessFullDetails?.name ?? "");

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Danger Zone</h1>

            <Separator />

                {/* Danger Zone */}
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            These actions are destructive and cannot be undone. Please be
                            careful.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="destructive"
                                onClick={() => setOpenModal("shifts")}
                            >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Reset All Staff Shifts
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => setOpenModal("menu")}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete All Menu Items
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => setOpenModal("ownership")}
                            >
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Transfer Ownership
                            </Button>

                            <div className="flex flex-col gap-1">
                                <Button
                                    variant="destructive"
                                    disabled={!canDelete}
                                    onClick={() => setOpenModal("business")}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Permanently Delete Business
                                </Button>
                                {deleteHint && (
                                    <p className="text-xs text-red-500">{deleteHint}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Confirm Modals */}
                <Dialog open={openModal === "shifts"} onOpenChange={() => setOpenModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset All Staff Shifts</DialogTitle>
                            <DialogDescription>
                                This will remove all current staff schedules. This action cannot
                                be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenModal(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => handleDangerAction("reset_shifts")}>
                                Confirm Reset
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={openModal === "menu"} onOpenChange={() => setOpenModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete All Menu Items</DialogTitle>
                            <DialogDescription>
                                This will remove every item in your menu permanently.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenModal(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => handleDangerAction("delete_menu")}>
                                Delete All
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={openModal === "ownership"} onOpenChange={() => setOpenModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transfer Ownership</DialogTitle>
                            <DialogDescription>
                                Transferring ownership gives full control of this business to
                                another staff member. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <Input placeholder="Enter recipient email" />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenModal(null)}>
                                Cancel
                            </Button>
                            <Button onClick={() => handleDangerAction("transfer_ownership")}>
                                Transfer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={openModal === "business"}
                    onOpenChange={() => {
                        setOpenModal(null);
                        setConfirmText("");
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Permanently Delete Business</DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-2 text-sm">
                                    <p className="text-red-600">
                                        This action is <strong>permanent and cannot be undone</strong>.
                                        All menus, shifts, schedules, inventory, and media will be deleted.
                                    </p>
                                    <p>
                                        Type <strong>{myBusinessFullDetails?.name}</strong> to confirm:
                                    </p>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <Input
                                placeholder={`Type "${myBusinessFullDetails?.name}" to confirm`}
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpenModal(null);
                                    setConfirmText("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!businessNameConfirmed || deletingBusiness}
                                onClick={handleDeleteBusiness}
                            >
                                {deletingBusiness ? "Deleting..." : "Delete permanently"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </div>
    );
};

export default OwnerDashboardPage;
