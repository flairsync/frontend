import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/features/profile/useProfile'
import { CheckCircle2, AlertCircle, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'
import { useTranslation } from 'react-i18next'

const VerificationRow = ({
    icon: Icon,
    label,
    value,
    verified,
    onVerify,
}: {
    icon: React.ElementType
    label: string
    value?: string
    verified?: boolean
    onVerify: () => void
}) => {
    const { t } = useTranslation('profile')
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    {value && (
                        <p className="text-xs text-muted-foreground truncate">{value}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {verified ? (
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('account_verification.verified')}
                    </Badge>
                ) : (
                    <>
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {t('account_verification.not_verified')}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={onVerify}>
                            {t('account_verification.verify')}
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

const AccountVerification = () => {
    const { t } = useTranslation('profile')
    const { userProfile } = useProfile()

    const handleVerifyEmail = () => {
        toast.info(t('account_verification.email_sent_toast', { email: userProfile?.email }))
    }

    const handleVerifyPhone = () => {
        if (!userProfile?.phoneNumber) {
            toast.info(t('account_verification.add_phone_first_toast'))
            return
        }
        toast.info(t('account_verification.sms_sent_toast', { phone: userProfile.phoneNumber }))
    }

    return (
        <AccordionItem value="verification" className="border rounded-lg px-3">
            <AccordionTrigger>{t('account_verification.title')}</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <VerificationRow
                    icon={Mail}
                    label={t('account_verification.email_address')}
                    value={userProfile?.email}
                    verified={userProfile?.emailVerified}
                    onVerify={handleVerifyEmail}
                />
                <VerificationRow
                    icon={Phone}
                    label={t('account_verification.phone_number')}
                    value={userProfile?.phoneNumber ?? t('account_verification.no_phone_number')}
                    verified={userProfile?.phoneVerified}
                    onVerify={handleVerifyPhone}
                />
            </AccordionContent>
        </AccordionItem>
    )
}

export default AccountVerification
