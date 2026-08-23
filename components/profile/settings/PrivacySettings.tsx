import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/features/profile/useProfile'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const PrivacySettings = () => {
    const { t } = useTranslation('profile')
    const [showFullName, setShowFullName] = useState(true)
    const {
        userProfile,
        updateUserProfile,
        updatingUserProfile,
    } = useProfile()

    useEffect(() => {
        setShowFullName(userProfile?.showFullNameOnReviews ?? true)
    }, [userProfile])

    const handleSave = () => {
        updateUserProfile(
            { showFullNameOnReviews: showFullName },
            {
                onSuccess: () => toast.success(t('privacy_settings.updated_toast')),
                onError: () => toast.error(t('privacy_settings.error_toast')),
            }
        )
    }

    return (
        <AccordionItem value="privacy" className="border rounded-lg px-3">
            <AccordionTrigger>{t('privacy_settings.title')}</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">{t('privacy_settings.show_full_name')}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t('privacy_settings.show_full_name_description')}
                        </p>
                    </div>
                    <Switch checked={showFullName} onCheckedChange={setShowFullName} />
                </div>
                <Button onClick={handleSave} disabled={updatingUserProfile}>
                    {updatingUserProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('privacy_settings.save')}
                </Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default PrivacySettings
