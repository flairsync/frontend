import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/features/profile/useProfile'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ProfilePreferencesSettings = () => {
    const { t } = useTranslation('profile');
    const [marketingMails, setMarketingMails] = useState(false);
    const {
        userProfile,
        loadingUserProfile,
        updateUserProfile,
        updatingUserProfile,
        updatedUserProfile
    } = useProfile();

    useEffect(() => {
        setMarketingMails(userProfile?.marketingEmails || false);
    }, [userProfile]);

    const handleUpdate = () => { }

    return (
        <>
            <AccordionItem value="marketing" className="border rounded-lg px-3">
                <AccordionTrigger>{t('profile_preferences_settings.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>{t('profile_preferences_settings.receive_marketing_emails')}</Label>
                        <Switch checked={marketingMails} onCheckedChange={setMarketingMails} />
                    </div>
                    <Button onClick={handleUpdate}>{t('marketing_settings.save')}</Button>
                </AccordionContent>
            </AccordionItem>


        </>
    )
}

export default ProfilePreferencesSettings