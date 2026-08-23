import { useTranslation } from "react-i18next"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldOff } from "lucide-react"

interface DisableTfaNoticeProps {
    onDisable: () => void
    loading?: boolean
}

export function DisableTfaNotice({ onDisable, loading }: DisableTfaNoticeProps) {
    const { t } = useTranslation('profile')
    return (
        <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
                <ShieldOff className="h-5 w-5 mt-0.5" />
                <div>
                    <AlertTitle>{t('disable_tfa_notice.title')}</AlertTitle>
                    <AlertDescription>
                        {t('disable_tfa_notice.description')}
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
                {loading ? t('disable_tfa_notice.disabling') : t('disable_tfa_notice.disable')}
            </Button>
        </Alert>
    )
}
