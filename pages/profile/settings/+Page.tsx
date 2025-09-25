"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

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
        <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Profile Info */}
            <AccordionItem value="profile-info" className="border rounded-lg px-3">
                <AccordionTrigger>Profile Information</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label>Name</Label>
                        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <Button onClick={saveProfileInfo}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Password */}
            <AccordionItem value="password" className="border rounded-lg px-3">
                <AccordionTrigger>Change Password</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
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
                </AccordionContent>
            </AccordionItem>

            {/* 2FA */}
            <AccordionItem value="twofa" className="border rounded-lg px-3">
                <AccordionTrigger>Two-Factor Authentication (2FA)</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>Enable 2FA</Label>
                        <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
                    </div>
                    <Button onClick={save2FA}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Marketing */}
            <AccordionItem value="marketing" className="border rounded-lg px-3">
                <AccordionTrigger>Marketing Preferences</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>Receive Marketing Emails</Label>
                        <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                    </div>
                    <Button onClick={saveMarketing}>Save</Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default ProfileSettingsPage
