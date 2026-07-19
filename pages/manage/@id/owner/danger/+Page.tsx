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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import { InputError } from "@/components/inputs/InputError";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { navigate } from "vike/client/router";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { useOwnershipTransfer } from "@/features/ownershipTransfer/useOwnershipTransfer";
import { AxiosError } from "axios";

const OwnerDashboardPage = () => {
    const { routeParams, tfa } = usePageContext();
    const businessId = routeParams.id as string;
    const tfaEnabled = tfa?.tfaEnabled ?? false;

    const { myBusinessFullDetails, deleteBusiness, deletingBusiness } = useMyBusiness(businessId);

    const {
        activeTransfer,
        initiateOwnershipTransfer,
        initiatingOwnershipTransfer,
        initiateOwnershipTransferError,
        resetInitiateOwnershipTransferError,
        cancelOwnershipTransfer,
        cancellingOwnershipTransfer,
    } = useOwnershipTransfer(businessId);

    const [openModal, setOpenModal] = useState<
        null | "shifts" | "menu" | "ownership" | "business"
    >(null);

    const [confirmText, setConfirmText] = useState("");

    const [newOwnerEmail, setNewOwnerEmail] = useState("");
    const [transferPassword, setTransferPassword] = useState("");
    const [transferTfaCode, setTransferTfaCode] = useState("");

    const resetTransferForm = () => {
        setNewOwnerEmail("");
        setTransferPassword("");
        setTransferTfaCode("");
        resetInitiateOwnershipTransferError();
    };

    const transferErrorMessage =
        initiateOwnershipTransferError instanceof AxiosError
            ? initiateOwnershipTransferError.response?.data?.message
            : undefined;

    const canSubmitTransfer =
        /\S+@\S+\.\S+/.test(newOwnerEmail) &&
        transferPassword.length > 0 &&
        (!tfaEnabled || transferTfaCode.length === 6);

    function handleInitiateTransfer() {
        initiateOwnershipTransfer(
            {
                newOwnerEmail,
                password: transferPassword,
                twoFactorCode: tfaEnabled ? transferTfaCode : undefined,
            },
            {
                onSuccess: () => {
                    setOpenModal(null);
                    resetTransferForm();
                },
            },
        );
    }

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

                {activeTransfer && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
                        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
                        <div className="flex-1 text-sm">
                            {activeTransfer.status === "PENDING_CONFIRMATION" ? (
                                <>
                                    <span className="font-semibold">Ownership transfer pending</span>{" "}
                                    confirmation from the invited new owner. The invite expires on{" "}
                                    <strong>{activeTransfer.tokenExpiresAt.toLocaleDateString()}</strong> if not confirmed.
                                </>
                            ) : (
                                <>
                                    <span className="font-semibold">Ownership transfer confirmed</span>{" "}
                                    and will complete automatically on{" "}
                                    <strong>{activeTransfer.graceEndsAt?.toLocaleDateString()}</strong> unless cancelled.
                                </>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-400 text-amber-800 hover:bg-amber-100 shrink-0"
                            disabled={cancellingOwnershipTransfer}
                            onClick={() => cancelOwnershipTransfer(activeTransfer.token)}
                        >
                            {cancellingOwnershipTransfer ? "Cancelling…" : "Cancel transfer"}
                        </Button>
                    </div>
                )}

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

                            <div className="flex flex-col gap-1">
                                <Button
                                    variant="destructive"
                                    disabled={activeTransfer != null}
                                    onClick={() => setOpenModal("ownership")}
                                >
                                    <ShieldAlert className="h-4 w-4 mr-2" />
                                    Transfer Ownership
                                </Button>
                                {activeTransfer && (
                                    <p className="text-xs text-red-500">
                                        A transfer is already in progress
                                    </p>
                                )}
                            </div>

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

                <Dialog
                    open={openModal === "ownership"}
                    onOpenChange={(open) => {
                        if (!open) {
                            setOpenModal(null);
                            resetTransferForm();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transfer Ownership</DialogTitle>
                            <DialogDescription>
                                The new owner must already have a FlairSync account with a
                                professional profile. They'll get an email to confirm — after
                                that there's a 3-day grace period during which either of you can
                                still cancel before the transfer completes.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="newOwnerEmail">New owner's email</Label>
                                <Input
                                    id="newOwnerEmail"
                                    type="email"
                                    placeholder="Enter recipient email"
                                    value={newOwnerEmail}
                                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                                />
                            </div>

                            <PasswordInput
                                label="Confirm your password"
                                name="transferPassword"
                                value={transferPassword}
                                onChange={(e) => setTransferPassword(e.target.value)}
                                placeholder="Enter your password"
                            />

                            {tfaEnabled && (
                                <div className="space-y-1">
                                    <Label>Two-factor authentication code</Label>
                                    <InputOTP
                                        maxLength={6}
                                        value={transferTfaCode}
                                        onChange={setTransferTfaCode}
                                    >
                                        <InputOTPGroup>
                                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                                <InputOTPSlot key={i} index={i} />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            )}

                            {transferErrorMessage && (
                                <InputError message={transferErrorMessage} />
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpenModal(null);
                                    resetTransferForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!canSubmitTransfer || initiatingOwnershipTransfer}
                                onClick={handleInitiateTransfer}
                            >
                                {initiatingOwnershipTransfer ? "Sending..." : "Transfer"}
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
