import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("management");
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
    const [newOwnerEmailTouched, setNewOwnerEmailTouched] = useState(false);
    const [transferPassword, setTransferPassword] = useState("");
    const [transferTfaCode, setTransferTfaCode] = useState("");
    // `pageContext.tfa.tfaEnabled` reflects this session's login/challenge state,
    // not reliably whether the account has 2FA configured — so in addition to
    // using it as an upfront hint, we also reveal the field reactively if the
    // backend ever comes back asking for a code (the actual source of truth).
    const [needsTfaCode, setNeedsTfaCode] = useState(false);
    const showTfaField = tfaEnabled || needsTfaCode;

    const resetTransferForm = () => {
        setNewOwnerEmail("");
        setNewOwnerEmailTouched(false);
        setTransferPassword("");
        setTransferTfaCode("");
        setNeedsTfaCode(false);
        resetInitiateOwnershipTransferError();
    };

    const transferErrorMessage =
        initiateOwnershipTransferError instanceof AxiosError
            ? initiateOwnershipTransferError.response?.data?.message
            : undefined;

    useEffect(() => {
        if (transferErrorMessage && /two-factor/i.test(transferErrorMessage)) {
            setNeedsTfaCode(true);
        }
    }, [transferErrorMessage]);

    const emailValid = /^\S+@\S+\.\S+$/.test(newOwnerEmail.trim());
    const newOwnerEmailError = !newOwnerEmailTouched
        ? undefined
        : newOwnerEmail.trim().length === 0
        ? t("danger_page.email_required")
        : !emailValid
        ? t("danger_page.email_invalid")
        : undefined;

    const canSubmitTransfer =
        emailValid &&
        transferPassword.length > 0 &&
        (!showTfaField || transferTfaCode.length === 6);

    function handleInitiateTransfer() {
        initiateOwnershipTransfer(
            {
                newOwnerEmail,
                password: transferPassword,
                twoFactorCode: showTfaField ? transferTfaCode : undefined,
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
        ? t("danger_page.unpublish_first")
        : (myBusinessFullDetails?.counts?.employees ?? 0) > 0
        ? t("danger_page.remove_staff_first", { count: myBusinessFullDetails?.counts?.employees ?? 0 })
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
            <h1 className="text-3xl font-bold tracking-tight">{t("danger_page.title")}</h1>

            <Separator />

                {activeTransfer && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
                        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
                        <div className="flex-1 text-sm">
                            {activeTransfer.status === "PENDING_CONFIRMATION" ? (
                                <>
                                    <span className="font-semibold">{t("danger_page.transfer_pending_label")}</span>{" "}
                                    {t("danger_page.transfer_pending_body")}{" "}
                                    <strong>{activeTransfer.tokenExpiresAt.toLocaleDateString()}</strong> {t("danger_page.transfer_pending_suffix")}
                                </>
                            ) : (
                                <>
                                    <span className="font-semibold">{t("danger_page.transfer_confirmed_label")}</span>{" "}
                                    {t("danger_page.transfer_confirmed_body")}{" "}
                                    <strong>{activeTransfer.graceEndsAt?.toLocaleDateString()}</strong> {t("danger_page.transfer_confirmed_suffix")}
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
                            {cancellingOwnershipTransfer ? t("danger_page.cancelling") : t("danger_page.cancel_transfer")}
                        </Button>
                    </div>
                )}

                {/* Danger Zone */}
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-600">{t("danger_page.title")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {t("danger_page.warning")}
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="destructive"
                                onClick={() => setOpenModal("shifts")}
                            >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                {t("danger_page.reset_shifts")}
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => setOpenModal("menu")}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("danger_page.delete_menu_items")}
                            </Button>

                            <div className="flex flex-col gap-1">
                                <Button
                                    variant="destructive"
                                    disabled={activeTransfer != null}
                                    onClick={() => setOpenModal("ownership")}
                                >
                                    <ShieldAlert className="h-4 w-4 mr-2" />
                                    {t("danger_page.transfer_ownership")}
                                </Button>
                                {activeTransfer && (
                                    <p className="text-xs text-red-500">
                                        {t("danger_page.transfer_in_progress")}
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
                                    {t("danger_page.delete_business")}
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
                            <DialogTitle>{t("danger_page.reset_shifts")}</DialogTitle>
                            <DialogDescription>
                                {t("danger_page.reset_shifts_description")}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenModal(null)}>
                                {t("danger_page.cancel")}
                            </Button>
                            <Button variant="destructive" onClick={() => handleDangerAction("reset_shifts")}>
                                {t("danger_page.confirm_reset")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={openModal === "menu"} onOpenChange={() => setOpenModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("danger_page.delete_menu_items")}</DialogTitle>
                            <DialogDescription>
                                {t("danger_page.delete_menu_items_description")}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenModal(null)}>
                                {t("danger_page.cancel")}
                            </Button>
                            <Button variant="destructive" onClick={() => handleDangerAction("delete_menu")}>
                                {t("danger_page.delete_all")}
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
                            <DialogTitle>{t("danger_page.transfer_ownership")}</DialogTitle>
                            <DialogDescription>
                                {t("danger_page.transfer_ownership_description")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="newOwnerEmail">{t("danger_page.new_owner_email")}</Label>
                                <Input
                                    id="newOwnerEmail"
                                    type="email"
                                    placeholder={t("danger_page.enter_recipient_email")}
                                    value={newOwnerEmail}
                                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                                    onBlur={() => setNewOwnerEmailTouched(true)}
                                />
                                {newOwnerEmailError && (
                                    <InputError message={newOwnerEmailError} />
                                )}
                            </div>

                            <PasswordInput
                                label={t("danger_page.confirm_your_password")}
                                name="transferPassword"
                                value={transferPassword}
                                onChange={(e) => setTransferPassword(e.target.value)}
                                placeholder={t("danger_page.enter_your_password")}
                            />

                            {showTfaField && (
                                <div className="space-y-1">
                                    <Label>{t("danger_page.tfa_code_label")}</Label>
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
                                {t("danger_page.cancel")}
                            </Button>
                            <Button
                                disabled={!canSubmitTransfer || initiatingOwnershipTransfer}
                                onClick={handleInitiateTransfer}
                            >
                                {initiatingOwnershipTransfer ? t("danger_page.sending") : t("danger_page.transfer")}
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
                            <DialogTitle>{t("danger_page.delete_business")}</DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-2 text-sm">
                                    <p className="text-red-600">
                                        {t("danger_page.delete_business_warning_prefix")}{" "}
                                        <strong>{t("danger_page.delete_business_warning_bold")}</strong>
                                        . {t("danger_page.delete_business_warning_suffix")}
                                    </p>
                                    <p>
                                        {t("danger_page.type_to_confirm_prefix")} <strong>{myBusinessFullDetails?.name}</strong> {t("danger_page.type_to_confirm_suffix")}
                                    </p>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <Input
                                placeholder={t("danger_page.type_name_placeholder", { name: myBusinessFullDetails?.name })}
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
                                {t("danger_page.cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!businessNameConfirmed || deletingBusiness}
                                onClick={handleDeleteBusiness}
                            >
                                {deletingBusiness ? t("danger_page.deleting") : t("danger_page.delete_permanently")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </div>
    );
};

export default OwnerDashboardPage;
