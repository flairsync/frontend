"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"

const DangerZoneSettings = () => {
    const { t } = useTranslation('profile')
    const { requestDeletion, requestingDeletion } = useAccountDeletion()

    return (
        <AccordionItem value="danger-zone" className="border border-destructive/50 rounded-lg px-3">
            <AccordionTrigger className="text-destructive hover:text-destructive hover:no-underline">
                <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('danger_zone_settings.title')}
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="space-y-1">
                    <p className="font-medium text-sm">{t('danger_zone_settings.delete_account')}</p>
                    <p className="text-sm text-muted-foreground">
                        {t('danger_zone_settings.delete_account_description')}
                    </p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            {t('danger_zone_settings.delete_my_account')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('danger_zone_settings.confirm_title')}</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-3 text-sm text-muted-foreground">
                                    <p>
                                        {t('danger_zone_settings.confirm_intro_prefix')}{" "}
                                        <span className="font-semibold text-foreground">{t('danger_zone_settings.thirty_days')}</span>
                                        {" "}{t('danger_zone_settings.confirm_intro_suffix')}
                                    </p>
                                    <p className="text-destructive font-medium">
                                        {t('danger_zone_settings.no_refund')}
                                    </p>
                                    <div className="rounded-md border p-3 space-y-2 text-xs">
                                        <div>
                                            <p className="font-semibold text-foreground mb-1">{t('danger_zone_settings.what_gets_deleted')}</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>{t('danger_zone_settings.deleted_items.identity')}</li>
                                                <li>{t('danger_zone_settings.deleted_items.avatar')}</li>
                                                <li>{t('danger_zone_settings.deleted_items.security')}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground mb-1">{t('danger_zone_settings.what_is_kept')}</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>{t('danger_zone_settings.kept_items.subscription_history')}</li>
                                                <li>{t('danger_zone_settings.kept_items.order_reservation_history')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('danger_zone_settings.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                                className={cn(buttonVariants({ variant: "destructive" }))}
                                onClick={() => requestDeletion()}
                                disabled={requestingDeletion}
                            >
                                {requestingDeletion ? t('danger_zone_settings.processing') : t('danger_zone_settings.confirm_delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AccordionContent>
        </AccordionItem>
    )
}

export default DangerZoneSettings
