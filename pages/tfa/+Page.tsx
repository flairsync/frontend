import React from "react"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,

} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { REGEXP_ONLY_DIGITS } from "input-otp"

export default function TwoFactorAuthPage() {
    const [otp, setOtp] = React.useState("")
    const [isVerifying, setIsVerifying] = React.useState(false)
    const [message, setMessage] = React.useState<{
        type: "info" | "error" | "success"
        text: string
    } | null>(null)

    const [showBackupInput, setShowBackupInput] = React.useState(false)
    const [backupPhrase, setBackupPhrase] = React.useState("")
    const [isVerifyingBackup, setIsVerifyingBackup] = React.useState(false)
    const [backupMessage, setBackupMessage] = React.useState<{
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

    const handleVerifyBackup = async () => {
        const words = backupPhrase.trim().split(/\s+/);
        if (words.length !== 12) {
            setBackupMessage({ type: "error", text: "Please enter all 12 recovery words." })
            return
        }
        setIsVerifyingBackup(true)
        setBackupMessage({ type: "info", text: "Verifying backup code..." })
        try {
            // TODO: call backup-code login endpoint
            await new Promise((r) => setTimeout(r, 1500))
            setBackupMessage({ type: "success", text: "✅ Backup code accepted!" })
        } catch (err) {
            setBackupMessage({ type: "error", text: "Invalid backup code. Please check your words and try again." })
        } finally {
            setIsVerifyingBackup(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md space-y-4">
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

                        <button
                            type="button"
                            className="w-full text-sm text-muted-foreground underline-offset-2 hover:underline text-center"
                            onClick={() => {
                                setShowBackupInput((v) => !v)
                                setBackupMessage(null)
                            }}
                        >
                            Lost access to your authenticator? Use a backup code instead.
                        </button>
                    </CardContent>
                </Card>

                {showBackupInput && (
                    <Card className="shadow-lg border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Enter Backup Code</CardTitle>
                            <CardDescription>
                                Enter your 12-word recovery phrase, separated by spaces.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="word1 word2 word3 … word12"
                                value={backupPhrase}
                                onChange={(e) => setBackupPhrase(e.target.value)}
                                className="font-mono text-sm"
                            />

                            <Button
                                onClick={handleVerifyBackup}
                                className="w-full"
                                disabled={isVerifyingBackup || backupPhrase.trim().split(/\s+/).length !== 12}
                            >
                                {isVerifyingBackup ? "Verifying…" : "Use Backup Code"}
                            </Button>

                            {backupMessage && (
                                <p
                                    className={`text-center text-sm ${backupMessage.type === "error"
                                        ? "text-destructive"
                                        : backupMessage.type === "success"
                                            ? "text-green-500"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    {backupMessage.text}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
