import React from "react"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,

} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { REGEXP_ONLY_DIGITS } from "input-otp"

export default function TwoFactorAuthPage() {
    const [otp, setOtp] = React.useState("")
    const [isVerifying, setIsVerifying] = React.useState(false)
    const [message, setMessage] = React.useState<{
        type: "info" | "error" | "success"
        text: string
    } | null>(null)

    const handleOTPChange = (value: string) => {
        setOtp(value)
    }

    const handleVerify = async () => {
        if (otp.length < 6) {
            setMessage({ type: "error", text: "Please enter the 6-digit code from your authenticator app." })
            return
        }
        setIsVerifying(true)
        setMessage({ type: "info", text: "Verifying 2FA code..." })
        try {
            // TODO: call your backend API to verify 2FA code
            await new Promise((r) => setTimeout(r, 1500))
            setMessage({ type: "success", text: "✅ Two-factor authentication successful!" })
        } catch (err) {
            setMessage({ type: "error", text: "Invalid or expired code. Please try again." })
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            Two-Factor Authentication
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter the 6-digit code from your authenticator app (like Google Authenticator or Authy)
                            to continue. This step adds an extra layer of security to your account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={handleOTPChange}
                                pattern={REGEXP_ONLY_DIGITS}
                                className="gap-2"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            onClick={handleVerify}
                            className="w-full"
                            disabled={otp.length < 6 || isVerifying}
                        >
                            {isVerifying ? "Verifying…" : "Confirm & Continue"}
                        </Button>

                        {message && (
                            <p
                                className={`text-center text-sm ${message.type === "error"
                                    ? "text-destructive"
                                    : message.type === "success"
                                        ? "text-green-500"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                {message.text}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
