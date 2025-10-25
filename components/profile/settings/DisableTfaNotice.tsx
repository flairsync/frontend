import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldOff } from "lucide-react"

interface DisableTfaNoticeProps {
    onDisable: () => void
    loading?: boolean
}

export function DisableTfaNotice({ onDisable, loading }: DisableTfaNoticeProps) {
    return (
        <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
                <ShieldOff className="h-5 w-5 mt-0.5" />
                <div>
                    <AlertTitle>Two-Factor Authentication Enabled</AlertTitle>
                    <AlertDescription>
                        Disabling 2FA will remove the extra layer of security on your account.
                        You’ll only need your password to log in after this action.
                    </AlertDescription>
                </div>
            </div>

            <Button
                variant="destructive"
                size="sm"
                className="mt-3 sm:mt-0"
                onClick={onDisable}
                disabled={loading}
            >
                {loading ? "Disabling..." : "Disable 2FA"}
            </Button>
        </Alert>
    )
}
