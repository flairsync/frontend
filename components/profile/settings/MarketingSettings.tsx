import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/features/profile/useProfile'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'

const MarketingSettings = () => {
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
                onSuccess: () => toast.success("Marketing preferences updated."),
                onError: () => toast.error("Failed to save preferences. Please try again."),
            }
        )
    }

    return (
        <AccordionItem value="marketing" className="border rounded-lg px-3">
            <AccordionTrigger>Marketing</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Marketing emails</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Receive news, promotions, and personalised offers.
                        </p>
                    </div>
                    <Switch checked={marketingMails} onCheckedChange={setMarketingMails} />
                </div>
                <Button onClick={handleSave} disabled={updatingUserProfile}>
                    {updatingUserProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save
                </Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default MarketingSettings
