import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/features/profile/useProfile'
import { CheckCircle2, AlertCircle, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'

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
}) => (
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
                    Verified
                </Badge>
            ) : (
                <>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Not verified
                    </Badge>
                    <Button size="sm" variant="outline" onClick={onVerify}>
                        Verify
                    </Button>
                </>
            )}
        </div>
    </div>
)

const AccountVerification = () => {
    const { userProfile } = useProfile()

    const handleVerifyEmail = () => {
        toast.info("A verification email has been sent to " + userProfile?.email + ".")
    }

    const handleVerifyPhone = () => {
        if (!userProfile?.phoneNumber) {
            toast.info("Please add a phone number in your profile settings first.")
            return
        }
        toast.info("A verification SMS has been sent to " + userProfile.phoneNumber + ".")
    }

    return (
        <AccordionItem value="verification" className="border rounded-lg px-3">
            <AccordionTrigger>Account Verification</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <VerificationRow
                    icon={Mail}
                    label="Email address"
                    value={userProfile?.email}
                    verified={userProfile?.emailVerified}
                    onVerify={handleVerifyEmail}
                />
                <VerificationRow
                    icon={Phone}
                    label="Phone number"
                    value={userProfile?.phoneNumber ?? "No phone number added"}
                    verified={userProfile?.phoneVerified}
                    onVerify={handleVerifyPhone}
                />
            </AccordionContent>
        </AccordionItem>
    )
}

export default AccountVerification
