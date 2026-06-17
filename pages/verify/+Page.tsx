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
import { navigate } from "vike/client/router"
import { useTranslation } from "react-i18next"

export default function VerifyAccountPage() {

    const { t } = useTranslation("auth")

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

    const RESEND_COOLDOWN_SECONDS = 30
    const [resendCooldown, setResendCooldown] = React.useState(0)

    React.useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setInterval(() => {
            setResendCooldown((prev) => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCooldown])

    const handleOTPComplete = (value: string) => {
        setOtp(value)
    }

    const handleVerify = () => {
        if (otp.length < 6) {
            setMessage({ type: "error", text: t("auth_page.verify.code_required") })
            return
        }

        setMessage({ type: "info", text: t("auth_page.verify.verifying_label") })

        verifyEmailOtp(
            otp, // ← send OTP to your API
            {
                onSuccess: () => {
                    setMessage({
                        type: "success",
                        text: t("auth_page.verify.success_message"),
                    })
                    const origin = new URLSearchParams(window.location.search).get('origin') || '/feed';
                    setTimeout(() => {
                        navigate(origin);
                    }, 1500);
                },
                onError: () => {
                    setMessage({
                        type: "error",
                        text: t("auth_page.verify.invalid_code"),
                    })
                },
            }
        )
    }

    const handleResend = () => {
        if (resendCooldown > 0) return

        resendOtpCode(undefined, {
            onSuccess: () => {
                setMessage({
                    type: "success",
                    text: t("auth_page.verify.resend_success"),
                })
                setResendCooldown(RESEND_COOLDOWN_SECONDS)
            },
            onError: () => {
                setMessage({
                    type: "error",
                    text: t("auth_page.verify.resend_error"),
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
                            {t("auth_page.verify.title")}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {t("auth_page.verify.description")}
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
                            {verifyingEmailOtp ? t("auth_page.verify.verifying_button") : t("auth_page.verify.verify_button")}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            {t("auth_page.verify.no_email_label")}{" "}
                            <Button
                                variant="link"
                                onClick={handleResend}
                                disabled={resendingOtpCode || resendCooldown > 0}
                                className="p-0 text-primary disabled:no-underline"
                            >
                                {resendingOtpCode
                                    ? t("auth_page.verify.resending_button")
                                    : resendCooldown > 0
                                        ? t("auth_page.verify.resend_in", { seconds: resendCooldown })
                                        : t("auth_page.verify.resend_button")}
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
                                    t("auth_page.verify.verification_failed")}
                            </p>
                        )}

                        {errorResendingOtpCode && (
                            <p className="text-center text-sm text-destructive">
                                {errorResendingOtpCode.response?.data?.message ||
                                    t("auth_page.verify.resend_failed")}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
