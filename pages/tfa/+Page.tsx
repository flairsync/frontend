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
import { useTfaChallenge } from "@/features/auth/useTfaChallenge"
import { usePageContext } from "vike-react/usePageContext"
import { navigate } from "vike/client/router"
import { useAuth } from "@/features/auth/useAuth"
import { useTranslation } from "react-i18next"

export default function TwoFactorAuthPage() {
    const { t } = useTranslation("auth")
    const { urlParsed } = usePageContext()
    const origin = urlParsed.search.origin || "/"
    const { logoutUser, loggingOut } = useAuth()
    const { mutateAsync: verifyTfaCode, isPending: isVerifying } = useTfaChallenge()

    const [otp, setOtp] = React.useState("")
    const [message, setMessage] = React.useState<{
        type: "info" | "error" | "success"
        text: string
    } | null>(null)

    const handleOTPChange = (value: string) => {
        setOtp(value)
    }

    const handleVerify = async () => {
        if (otp.length < 6) {
            setMessage({ type: "error", text: t("auth_page.tfa.code_required") })
            return
        }
        setMessage({ type: "info", text: t("auth_page.tfa.verifying_label") })
        try {
            const result = await verifyTfaCode(otp)
            if (result.success) {
                setMessage({ type: "success", text: t("auth_page.tfa.success_message") })
                // The access cookie was just reissued with tfaVerified=true — re-fetch
                // SSR data on the way so the rest of the app reflects the new state.
                navigate(origin, { keepScrollPosition: true })
            } else {
                setOtp("")
                setMessage({ type: "error", text: t("auth_page.tfa.invalid_code") })
            }
        } catch (err) {
            setOtp("")
            setMessage({ type: "error", text: t("auth_page.tfa.invalid_code") })
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md space-y-4">
                <Card className="shadow-lg border-border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            {t("auth_page.tfa.title")}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {t("auth_page.tfa.description")}
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
                            {isVerifying ? t("auth_page.tfa.verifying_button") : t("auth_page.tfa.confirm_button")}
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

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-sm text-muted-foreground"
                            onClick={() => logoutUser()}
                            disabled={loggingOut}
                        >
                            {loggingOut ? t("auth_page.tfa.logging_out_button") : t("auth_page.tfa.logout_button")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
