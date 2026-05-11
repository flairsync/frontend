"use client"

import React from "react"
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
    const { requestDeletion, requestingDeletion } = useAccountDeletion()

    return (
        <AccordionItem value="danger-zone" className="border border-destructive/50 rounded-lg px-3">
            <AccordionTrigger className="text-destructive hover:text-destructive hover:no-underline">
                <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="space-y-1">
                    <p className="font-medium text-sm">Delete account</p>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete your account. You have a 30-day window to cancel after
                        requesting deletion.
                    </p>
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
                                        <span className="font-semibold text-foreground">30 days</span>. You
                                        can cancel this within the 30-day window by logging back in.
                                    </p>
                                    <p className="text-destructive font-medium">
                                        Your subscription will not be refunded.
                                    </p>
                                    <div className="rounded-md border p-3 space-y-2 text-xs">
                                        <div>
                                            <p className="font-semibold text-foreground mb-1">What gets deleted:</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>Name, email, phone number, date of birth</li>
                                                <li>Avatar and profile photo</li>
                                                <li>Password and 2FA settings</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground mb-1">What is kept (anonymised):</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>Subscription history (legal/financial records)</li>
                                                <li>Order and reservation history</li>
                                            </ul>
                                        </div>
                                    </div>
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
            </AccordionContent>
        </AccordionItem>
    )
}

export default DangerZoneSettings
