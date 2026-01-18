import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRCodeCanvas } from "qrcode.react"
import QRCode from "react-qr-code";

type QrModalProps = {
    qrValue?: string | null
    title?: string,
    description?: string,
    onClose?: () => void
}

export function QrcodePopup({ qrValue, title = "Scan QR Code", onClose, description }: QrModalProps) {
    const isOpen = Boolean(qrValue)

    return (
        <Dialog open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent className="sm:max-w-sm flex flex-col items-center gap-4">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {qrValue && (
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={qrValue}
                        viewBox={`0 0 256 256`}
                    />
                )}
                <DialogDescription
                    className="text-center"
                >
                    {description}
                </DialogDescription>
            </DialogContent>
        </Dialog>
    )
}