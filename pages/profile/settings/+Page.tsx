import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp } from "lucide-react"

const CollapsibleCard: React.FC<{
    title: string
    children: React.ReactNode
}> = ({ title, children }) => {
    const [open, setOpen] = useState(true)
    return (
        <Card>
            <CardHeader
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <CardTitle>{title}</CardTitle>
                {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardHeader>
            {open && <CardContent className="space-y-4">{children}</CardContent>}
        </Card>
    )
}

const ProfileSettingsPage = () => {
    const [name, setName] = useState("John Doe")
    const [email, setEmail] = useState("johndoe@email.com")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [twoFAEnabled, setTwoFAEnabled] = useState(false)
    const [marketingEmails, setMarketingEmails] = useState(true)

    const saveProfileInfo = () => {
        console.log({ name, email })
        alert("Profile info saved!")
    }

    const savePassword = () => {
        if (!currentPassword) {
            alert("Current password is required to change password.")
            return
        }
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.")
            return
        }
        console.log({ currentPassword, newPassword })
        alert("Password updated!")
    }

    const save2FA = () => {
        console.log({ twoFAEnabled })
        alert("Two-Factor Authentication settings saved!")
    }

    const saveMarketing = () => {
        console.log({ marketingEmails })
        alert("Marketing preferences saved!")
    }

    return (
        <div className="space-y-4">
            {/* Profile Info */}
            <CollapsibleCard title="Profile Information">
                <div className="space-y-1">
                    <Label>Name</Label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button onClick={saveProfileInfo}>Save</Button>
            </CollapsibleCard>

            {/* Password */}
            <CollapsibleCard title="Change Password">
                <div className="space-y-1">
                    <Label>Current Password</Label>
                    <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                    />
                </div>
                <div className="space-y-1">
                    <Label>New Password</Label>
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Confirm New Password</Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                </div>
                <Button onClick={savePassword}>Save</Button>
            </CollapsibleCard>

            {/* Two-Factor Authentication */}
            <CollapsibleCard title="Two-Factor Authentication (2FA)">
                <div className="flex items-center justify-between">
                    <Label>Enable 2FA</Label>
                    <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
                </div>
                <Button onClick={save2FA}>Save</Button>
            </CollapsibleCard>

            {/* Marketing Emails */}
            <CollapsibleCard title="Marketing Preferences">
                <div className="flex items-center justify-between">
                    <Label>Receive Marketing Emails</Label>
                    <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>
                <Button onClick={saveMarketing}>Save</Button>
            </CollapsibleCard>
        </div>
    )
}

export default ProfileSettingsPage
