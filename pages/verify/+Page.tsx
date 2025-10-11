import React from "react"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,

} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function VerifyAccountPage() {
    const [otp, setOtp] = React.useState("")
    const [isResending, setIsResending] = React.useState(false)
    const [isVerifying, setIsVerifying] = React.useState(false)
    const [message, setMessage] = React.useState<{
        type: "info" | "error" | "success"
        text: string
    } | null>(null)

    const handleOTPComplete = (value: string) => {
        setOtp(value)
    }

    const handleVerify = async () => {
        if (otp.length < 6) {
            setMessage({ type: "error", text: "Please enter the 6-digit code." })
            return
        }
        setIsVerifying(true)
        setMessage({ type: "info", text: "Verifying your account..." })
        try {
            // TODO: call your verification API
            await new Promise((r) => setTimeout(r, 1500))
            setMessage({ type: "success", text: "✅ Account verified successfully!" })
        } catch (err) {
            setMessage({ type: "error", text: "Something went wrong. Try again." })
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        setMessage({ type: "info", text: "Resending verification code..." })
        try {
            // TODO: call your resend API
            await new Promise((r) => setTimeout(r, 1500))
            setMessage({ type: "success", text: "A new verification code has been sent." })
        } catch (err) {
            setMessage({ type: "error", text: "Couldn't resend code. Please try later." })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            Verify Your Account
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            We’ve sent a one-time verification code to your email. Please enter it below to
                            verify your account. This helps us confirm it's really you. If you did not receive
                            it, you can resend the code.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={handleOTPComplete}
                                className="gap-2"
                                pattern={REGEXP_ONLY_DIGITS}

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
                            {isVerifying ? "Verifying…" : "Verify Account"}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Didn’t get the email?{" "}
                            <Button
                                variant="link"
                                onClick={handleResend}
                                disabled={isResending}
                                className="p-0 text-primary"
                            >
                                {isResending ? "Resending…" : "Resend code"}
                            </Button>
                        </div>

                        {message && (
                            <p
                                className={`text-center text-sm ${message.type === "error"
                                    ? "text-destructive"
                                    : message.type === "success"
                                        ? "text-green-500"
                                        : "text-foreground"
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
