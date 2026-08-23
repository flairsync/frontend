"use client"

import React from "react"
import { useTranslation, Trans } from "react-i18next"
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
    const { t } = useTranslation("profile")
    const { exportStatus, loadingExportStatus, requestExport, requestingExport, cooldownError } =
        useDataExport()

    const canRequest = exportStatus?.status === "none"

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t("account_page.export.title")}
                </CardTitle>
                <CardDescription>
                    {t("account_page.export.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {loadingExportStatus ? (
                    <Skeleton className="h-9 w-44" />
                ) : exportStatus?.status === "ready" ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                            <span>✓</span>
                            <span>{t("account_page.export.ready")}</span>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <a href={exportStatus.downloadUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                {t("account_page.export.download_button")}
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            {t("account_page.export.link_expiry")}
                        </p>
                    </div>
                ) : exportStatus?.status === "pending" ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("account_page.export.preparing")}
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
                                    {t("account_page.export.requesting")}
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("account_page.export.request_button")}
                                </>
                            )}
                        </Button>
                        {cooldownError && (
                            <p className="text-sm text-destructive">{cooldownError}</p>
                        )}
                    </div>
                )}

                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">{t("account_page.export.included_heading")}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>
                            <span className="font-medium text-foreground">profile.json</span> — {t("account_page.export.included_profile")}
                        </li>
                        <li>
                            <span className="font-medium text-foreground">social-accounts.json</span> — {t("account_page.export.included_social")}
                        </li>
                        <li>
                            <span className="font-medium text-foreground">subscriptions.json</span> — {t("account_page.export.included_subscriptions")}
                        </li>
                    </ul>
                    <p className="pt-1">{t("account_page.export.rate_limit")}</p>
                </div>
            </CardContent>
        </Card>
    )
}

const AccountPage = () => {
    const { t } = useTranslation("profile")
    const { requestDeletion, requestingDeletion } = useAccountDeletion()

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-xl font-semibold">{t("account_page.title")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("account_page.subtitle")}
                </p>
            </div>

            <Separator />

            <DataExportSection />

            {/* Delete account */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        {t("account_page.delete.title")}
                    </CardTitle>
                    <CardDescription>
                        <Trans i18nKey="account_page.delete.description" ns="profile" components={{ b: <span className="font-medium text-foreground" /> }} />
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-2">
                        <div>
                            <p className="font-semibold text-foreground mb-1">{t("account_page.delete.what_gets_deleted_heading")}</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                <li>{t("account_page.delete.deleted_item_1")}</li>
                                <li>{t("account_page.delete.deleted_item_2")}</li>
                                <li>{t("account_page.delete.deleted_item_3")}</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">{t("account_page.delete.what_is_kept_heading")}</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                <li>{t("account_page.delete.kept_item_1")}</li>
                                <li>{t("account_page.delete.kept_item_2")}</li>
                            </ul>
                        </div>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                {t("account_page.delete.delete_button")}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t("account_page.delete.confirm_title")}</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>
                                            <Trans i18nKey="account_page.delete.confirm_description" ns="profile" components={{ b: <span className="font-semibold text-foreground" /> }} />
                                        </p>
                                        <p className="font-medium text-destructive">
                                            {t("account_page.delete.no_refund_notice")}
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t("account_page.delete.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                    className={cn(buttonVariants({ variant: "destructive" }))}
                                    onClick={() => requestDeletion()}
                                    disabled={requestingDeletion}
                                >
                                    {requestingDeletion ? t("account_page.delete.processing") : t("account_page.delete.confirm_button")}
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
