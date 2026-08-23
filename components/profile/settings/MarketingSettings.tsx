import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/features/profile/useProfile'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const MarketingSettings = () => {
    const { t } = useTranslation('profile')
    const [marketingMails, setMarketingMails] = useState(false)
    const {
        userProfile,
        updateUserProfile,
        updatingUserProfile,
    } = useProfile()

    useEffect(() => {
        setMarketingMails(userProfile?.marketingEmails ?? false)
    }, [userProfile])

    const handleSave = () => {
        updateUserProfile(
            { marketingEmail: marketingMails },
            {
                onSuccess: () => toast.success(t('marketing_settings.updated_toast')),
                onError: () => toast.error(t('marketing_settings.error_toast')),
            }
        )
    }

    return (
        <AccordionItem value="marketing" className="border rounded-lg px-3">
            <AccordionTrigger>{t('marketing_settings.title')}</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">{t('marketing_settings.marketing_emails')}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t('marketing_settings.marketing_emails_description')}
                        </p>
                    </div>
                    <Switch checked={marketingMails} onCheckedChange={setMarketingMails} />
                </div>
                <Button onClick={handleSave} disabled={updatingUserProfile}>
                    {updatingUserProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('marketing_settings.save')}
                </Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default MarketingSettings
