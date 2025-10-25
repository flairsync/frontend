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
import { checkTfaApiCall } from "@/features/profileSettings/service"
import { toast } from "sonner"

interface TfaCodeModalProps {
    open: boolean
    closeModal: () => void
}

export const TfaCodeNeededModal: React.FC<TfaCodeModalProps> = ({
    open,
    closeModal,
}) => {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
        if (code.length !== 6) return
        setLoading(true);
        checkTfaApiCall(code).then(res => {
            if (res.data.success) {
                toast("TFA Validated")
            } else {
                console.log("ERROR within success", res);
            }
        }).catch(err => {
            console.log("ERROR", err);
        }).finally(() => {
            setCode("");
            setLoading(false);
            closeModal();

        })
    }

    return (
        <Dialog open={open} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{"Two factor auth code"}</DialogTitle>
                    <DialogDescription>Please enter your two factor auth code in order to continue</DialogDescription>
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
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>
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

export default TfaCodeNeededModal
