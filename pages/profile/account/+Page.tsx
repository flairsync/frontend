"use client"

import React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAccountDeletion } from "@/features/profileSettings/useAccountDeletion"
import { useDataExport } from "@/features/profileSettings/useDataExport"
import { cn } from "@/lib/utils"
import { Download, Loader2, Trash2 } from "lucide-react"

const DataExportSection = () => {
    const { exportStatus, loadingExportStatus, requestExport, requestingExport, cooldownError } =
        useDataExport()

    const canRequest = exportStatus?.status === "none"

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download your data
                </CardTitle>
                <CardDescription>
                    Request a copy of your personal data (GDPR Article 20 — right to data portability).
                    The export includes your profile, linked accounts, and subscription history as a ZIP
                    archive. You&apos;ll receive an email with the download link.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {loadingExportStatus ? (
                    <Skeleton className="h-9 w-44" />
                ) : exportStatus?.status === "ready" ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                            <span>✓</span>
                            <span>Your data export is ready.</span>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <a href={exportStatus.downloadUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download my data
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Download link expires 7 days after the export was generated.
                        </p>
                    </div>
                ) : exportStatus?.status === "pending" ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Your export is being prepared. We&apos;ll email you when it&apos;s ready.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => requestExport()}
                            disabled={requestingExport || !canRequest}
                        >
                            {requestingExport ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Requesting…
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Request a copy of my data
                                </>
                            )}
                        </Button>
                        {cooldownError && (
                            <p className="text-sm text-destructive">{cooldownError}</p>
                        )}
                    </div>
                )}

                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">What&apos;s included in the export:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>
                            <span className="font-medium text-foreground">profile.json</span> — account info,
                            email, phone, date of birth, preferences
                        </li>
                        <li>
                            <span className="font-medium text-foreground">social-accounts.json</span> — linked
                            login providers
                        </li>
                        <li>
                            <span className="font-medium text-foreground">subscriptions.json</span> — subscription
                            history
                        </li>
                    </ul>
                    <p className="pt-1">One export request allowed every 30 days.</p>
                </div>
            </CardContent>
        </Card>
    )
}

const AccountPage = () => {
    const { requestDeletion, requestingDeletion } = useAccountDeletion()

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-xl font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your account data and deletion settings.
                </p>
            </div>

            <Separator />

            <DataExportSection />

            {/* Delete account */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete account
                    </CardTitle>
                    <CardDescription>
                        Permanently delete your account. This begins a{" "}
                        <span className="font-medium text-foreground">30-day grace period</span> — you can
                        log back in and cancel at any time during that window. After 30 days your personal
                        data is anonymised and cannot be recovered.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-2">
                        <div>
                            <p className="font-semibold text-foreground mb-1">What gets deleted:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                <li>Name, email address, phone number, date of birth</li>
                                <li>Avatar and profile photo</li>
                                <li>Password and two-factor authentication</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">What is kept (anonymised):</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                <li>Subscription history — required for legal and financial records</li>
                                <li>Order and reservation history</li>
                            </ul>
                        </div>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                Delete my account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>
                                            Your account will be permanently deleted after{" "}
                                            <span className="font-semibold text-foreground">30 days</span>.
                                            You can cancel this within the 30-day window by logging back in.
                                        </p>
                                        <p className="font-medium text-destructive">
                                            Your subscription will not be refunded.
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className={cn(buttonVariants({ variant: "destructive" }))}
                                    onClick={() => requestDeletion()}
                                    disabled={requestingDeletion}
                                >
                                    {requestingDeletion ? "Processing…" : "Yes, delete my account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountPage
