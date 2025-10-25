import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

interface TfaCodeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (code: string) => void
    title?: string
    description?: string
    loading?: boolean
}

export const TfaCodeModal: React.FC<TfaCodeModalProps> = ({
    open,
    onOpenChange,
    onConfirm,
    title = "Enter Two-Factor Code",
    description = "Enter the 6-digit code from your authenticator app to continue.",
    loading
}) => {
    const [code, setCode] = useState("")

    const handleConfirm = async () => {
        if (code.length !== 6) return
        try {
            onConfirm(code)
        } finally {
            setCode("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {/* OTP Input */}
                <div className="flex justify-center py-4">
                    <InputOTP maxLength={6} value={code} onChange={setCode}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={code.length !== 6 || loading}>
                        {loading ? "Verifying..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TfaCodeModal
