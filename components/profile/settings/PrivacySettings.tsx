import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/features/profile/useProfile'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'

const PrivacySettings = () => {
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
                onSuccess: () => toast.success("Privacy preferences updated."),
                onError: () => toast.error("Failed to save preferences. Please try again."),
            }
        )
    }

    return (
        <AccordionItem value="privacy" className="border rounded-lg px-3">
            <AccordionTrigger>Privacy</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Show full name on my reviews</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Reviews you post are public. When off, we show your first name and last initial instead of your full last name.
                        </p>
                    </div>
                    <Switch checked={showFullName} onCheckedChange={setShowFullName} />
                </div>
                <Button onClick={handleSave} disabled={updatingUserProfile}>
                    {updatingUserProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save
                </Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default PrivacySettings
