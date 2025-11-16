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
import { useVerification } from "@/features/auth/useVerification"
import { usePageContext } from "vike-react/usePageContext"

export default function VerifyAccountPage() {

    const {
        user
    } = usePageContext();
    console.log("USERRRRRRRRRRRR ", user);

    const {
        resendOtpCode,
        errorResendingOtpCode,
        resendingOtpCode,

        verifyEmailOtp,
        verifyingEmailOtp,
        errorVerifyingEmailOtp,
    } = useVerification()

    const [otp, setOtp] = React.useState("")
    const [message, setMessage] = React.useState<{
        type: "info" | "error" | "success"
        text: string
    } | null>(null)

    const handleOTPComplete = (value: string) => {
        setOtp(value)
    }

    const handleVerify = () => {
        if (otp.length < 6) {
            setMessage({ type: "error", text: "Please enter the 6-digit code." })
            return
        }

        setMessage({ type: "info", text: "Verifying your account..." })

        verifyEmailOtp(
            otp, // ← send OTP to your API
            {
                onSuccess: () => {
                    setMessage({
                        type: "success",
                        text: "✅ Account verified successfully!",
                    })
                },
                onError: () => {
                    setMessage({
                        type: "error",
                        text: "Invalid code. Please try again.",
                    })
                },
            }
        )
    }

    const handleResend = () => {
        resendOtpCode(undefined, {
            onSuccess: () => {
                setMessage({
                    type: "success",
                    text: "A new code has been sent to your email.",
                })
            },
            onError: () => {
                setMessage({
                    type: "error",
                    text: "Failed to resend the verification code.",
                })
            },
        })
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
                            We’ve sent a one-time verification code to your email.
                            Enter it below to verify your account. If you did not
                            receive it, you can resend the code.
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
                            disabled={otp.length < 6 || verifyingEmailOtp}
                        >
                            {verifyingEmailOtp ? "Verifying…" : "Verify Account"}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Didn’t get the email?{" "}
                            <Button
                                variant="link"
                                onClick={handleResend}
                                disabled={resendingOtpCode}
                                className="p-0 text-primary"
                            >
                                {resendingOtpCode ? "Resending…" : "Resend code"}
                            </Button>
                        </div>

                        {/* Local UI messages */}
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

                        {/* API-level errors (fallback display) */}
                        {errorVerifyingEmailOtp && (
                            <p className="text-center text-sm text-destructive">
                                {errorVerifyingEmailOtp.response?.data?.message ||
                                    "Verification failed."}
                            </p>
                        )}

                        {errorResendingOtpCode && (
                            <p className="text-center text-sm text-destructive">
                                {errorResendingOtpCode.response?.data?.message ||
                                    "Failed to resend code."}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
