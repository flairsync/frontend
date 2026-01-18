import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmationModalProps = {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "default" | "danger" // danger = red confirm button
}

export function ConfirmationPopup({
    isOpen,
    onConfirm,
    onCancel,
    title = "Are you sure?",
    description = "Do you want to proceed with this action?",
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    variant = "default",
}: ConfirmationModalProps) {
    const confirmButtonClass =
        variant === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button className={confirmButtonClass} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
