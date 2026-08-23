import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTfaSettings } from "@/features/profileSettings/useTfaSettings"
import { QRCodeSVG } from 'qrcode.react';
import TfaCodeModal from "@/components/inputs/TfaCodeModal"
import { DisableTfaNotice } from "./DisableTfaNotice"
import { AlertTriangle, Check, Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

const ProfileTfaSettings = () => {
    const { t } = useTranslation('profile')
    const {
        userTfaStatus,
        initializeTfaSetupApiCall,
        validateTfaCode,
        validatedTfaCode,
        disableTfaCode,
        disablingTfaCode,
        disabledTfa,
        recoverWords,
        regenerateBackupCodes,
        regeneratingBackupCodes,
        regenDisabled,
    } = useTfaSettings()

    const [open, setOpen] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [qrCodeLink, setQrcodeLink] = useState('');
    const [updatingTfaStatus, setUpdatingTfaStatus] = useState(0); // 0 = none, 1 = enabling, 2 = disabling
    const [copiedField, setCopiedField] = useState<"secret" | "link" | null>(null);

    // The QR value is a full otpauth:// URI with the raw base32 secret embedded
    // as a query param — pull it out for a manual-entry fallback.
    const tfaSecret = useMemo(() => {
        if (!qrCodeLink) return "";
        try {
            return new URL(qrCodeLink).searchParams.get("secret") ?? "";
        } catch {
            return "";
        }
    }, [qrCodeLink]);

    // Recovery codes dialog state
    const [recoveryCodes, setRecoveryCodes] = useState("");
    const [savedAcknowledged, setSavedAcknowledged] = useState(false);
    const [codeDownloaded, setCodeDownloaded] = useState(false);
    const viewedRecoverCodes = useRef(false);

    // Regenerate confirmation dialog
    const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);

    useEffect(() => {
        if (validatedTfaCode) {
            setOpen(false);
        }
        if (disabledTfa) {
            setUpdatingTfaStatus(0);
        }
        if (recoverWords && recoverWords.length > 0 && !viewedRecoverCodes.current) {
            setRecoveryCodes(recoverWords);
            setSavedAcknowledged(false);
            setCodeDownloaded(false);
            viewedRecoverCodes.current = true;
        }
    }, [validatedTfaCode, disabledTfa, recoverWords]);

    const generateQrCodeUrl = () => {
        if (!qrCodeLink || qrCodeLink.length === 0)
            initializeTfaSetupApiCall().then(res => {
                if (res.data.success) {
                    setQrcodeLink(res.data.data.link);
                }
            })
    }

    const handleVerify = () => {
        validateTfaCode(verificationCode)
    }

    const handleCopy = async (text: string, field: "secret" | "link") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success(field === "secret" ? t('profile_tfa_settings.secret_copied') : t('profile_tfa_settings.link_copied'));
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error(t('profile_tfa_settings.copy_failed'));
        }
    }

    const handleDownloadBackupCodes = () => {
        regenerateBackupCodes(undefined, {
            onSuccess: () => {
                setCodeDownloaded(true);
                toast.success(t('profile_tfa_settings.backup_codes_downloaded'));
            },
        });
    }

    const handleConfirmRegenerate = () => {
        setConfirmRegenOpen(false);
        regenerateBackupCodes(undefined, {
            onSuccess: () => {
                toast.success(t('profile_tfa_settings.backup_codes_downloaded'));
            },
        });
    }

    const canCloseRecoveryCodes = savedAcknowledged || codeDownloaded;

    return (
        <>
            {/* Recovery codes blocking dialog — shown after initial 2FA setup */}
            <Dialog
                open={recoveryCodes.length > 0}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && !canCloseRecoveryCodes) return;
                    if (!nextOpen) setRecoveryCodes("");
                }}
            >
                <DialogContent
                    className="sm:max-w-md"
                    onPointerDownOutside={(e) => { if (!canCloseRecoveryCodes) e.preventDefault(); }}
                    onEscapeKeyDown={(e) => { if (!canCloseRecoveryCodes) e.preventDefault(); }}
                >
                    <DialogHeader>
                        <DialogTitle>{t('profile_tfa_settings.save_backup_codes_title')}</DialogTitle>
                        <DialogDescription>
                            {t('profile_tfa_settings.save_backup_codes_description')}
                        </DialogDescription>
                    </DialogHeader>

                    <Alert className="border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="font-medium ml-2">
                            {t('profile_tfa_settings.codes_not_shown_again')}
                        </AlertDescription>
                    </Alert>

                    <Alert variant="default" className="font-mono text-sm break-all">
                        {recoveryCodes}
                    </Alert>

                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleDownloadBackupCodes}
                        disabled={regeneratingBackupCodes || regenDisabled}
                    >
                        <Download className="h-4 w-4" />
                        {regeneratingBackupCodes ? t('profile_tfa_settings.downloading') : t('profile_tfa_settings.download_as_pdf')}
                    </Button>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="saved-codes"
                            checked={savedAcknowledged}
                            onCheckedChange={(checked) => setSavedAcknowledged(checked === true)}
                        />
                        <Label htmlFor="saved-codes" className="text-sm cursor-pointer">
                            {t('profile_tfa_settings.saved_codes_acknowledgement')}
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            disabled={!canCloseRecoveryCodes}
                            onClick={() => setRecoveryCodes("")}
                        >
                            {t('profile_tfa_settings.done')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Disable 2FA confirmation modal */}
            <TfaCodeModal
                onConfirm={(code) => {
                    if (updatingTfaStatus === 2) {
                        disableTfaCode(code);
                    }
                }}
                loading={disablingTfaCode}
                onOpenChange={() => setUpdatingTfaStatus(0)}
                open={updatingTfaStatus > 0}
            />

            {/* Regenerate backup codes confirmation dialog */}
            <AlertDialog open={confirmRegenOpen} onOpenChange={setConfirmRegenOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('profile_tfa_settings.regenerate_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('profile_tfa_settings.regenerate_confirm_description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('profile_tfa_settings.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRegenerate}>
                            {t('profile_tfa_settings.continue')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AccordionItem value="twofa" className="border rounded-lg px-3">
                <AccordionTrigger>{t('profile_tfa_settings.title')}</AccordionTrigger>

                <AccordionContent className="space-y-4 py-2">
                    <CardDescription>
                        {t('profile_tfa_settings.description')}
                    </CardDescription>

                    {userTfaStatus?.tfaSetup ? (
                        <div className="flex flex-col gap-3">
                            <DisableTfaNotice
                                onDisable={() => setUpdatingTfaStatus(2)}
                            />
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium">{t('profile_tfa_settings.backup_codes')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('profile_tfa_settings.backup_codes_description')}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 shrink-0 ml-4"
                                    onClick={() => setConfirmRegenOpen(true)}
                                    disabled={regeneratingBackupCodes || regenDisabled}
                                    title={regenDisabled ? t('profile_tfa_settings.regen_rate_limit_hint') : undefined}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    {t('profile_tfa_settings.regenerate_backup_codes')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <Button onClick={() => {
                                generateQrCodeUrl();
                                setOpen(true);
                            }}>
                                {t('profile_tfa_settings.setup_2fa')}
                            </Button>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            {/* 2FA Setup Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('profile_tfa_settings.enable_2fa_title')}</DialogTitle>
                        <DialogDescription>
                            {t('profile_tfa_settings.enable_2fa_description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center py-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <QRCodeSVG value={qrCodeLink} />
                        </div>
                    </div>

                    {tfaSecret && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                    {t('profile_tfa_settings.cant_scan')}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 min-w-0 rounded-md border bg-muted px-3 py-2 text-sm font-mono tracking-wider break-all">
                                        {tfaSecret}
                                    </code>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() => handleCopy(tfaSecret, "secret")}
                                    >
                                        {copiedField === "secret" ? (
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span>{t('profile_tfa_settings.same_phone_hint')}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto gap-1.5 px-2 py-1 text-xs"
                                    onClick={() => handleCopy(qrCodeLink, "link")}
                                >
                                    {copiedField === "link" ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                    {t('profile_tfa_settings.copy_setup_link')}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="tfa-code">{t('profile_tfa_settings.enter_code')}</Label>
                        <Input
                            id="tfa-code"
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center tracking-widest text-lg"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            {t('profile_tfa_settings.cancel')}
                        </Button>
                        <Button onClick={handleVerify} disabled={verificationCode.length !== 6}>
                            {t('profile_tfa_settings.verify')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ProfileTfaSettings
