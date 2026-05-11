"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useAccountDeletion } from "@/features/profileSettings/useAccountDeletion"
import { useAuth } from "@/features/auth/useAuth"
import { AlertTriangle } from "lucide-react"

interface PendingDeletionScreenProps {
    deletionRequestedAt: string
}

const PendingDeletionScreen = ({ deletionRequestedAt }: PendingDeletionScreenProps) => {
    const { cancelDeletion, cancellingDeletion } = useAccountDeletion()
    const { logoutUser, loggingOut } = useAuth()

    const deletionDate = new Date(
        new Date(deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000
    )

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Your account is scheduled for deletion</h1>
                    <p className="text-muted-foreground">
                        This account will be permanently deleted on{" "}
                        <span className="font-semibold text-foreground">
                            {deletionDate.toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                        . If this was a mistake, you can cancel the deletion below.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => cancelDeletion()}
                        disabled={cancellingDeletion}
                        className="w-full"
                    >
                        {cancellingDeletion ? "Cancelling…" : "Cancel deletion"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => logoutUser()}
                        disabled={loggingOut}
                        className="w-full"
                    >
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PendingDeletionScreen
