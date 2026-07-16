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
import ProfileTfaSettings from "@/components/profile/settings/ProfileTfaSettings"
import ProfileInfoSettings from "@/components/profile/settings/ProfileInfoSettings"
import PasswordSettings from "@/components/profile/settings/PasswordSettings"
import SessionManagementSettings from "@/components/profile/settings/SessionManagementSettings"
import AccountVerification from "@/components/profile/settings/AccountVerification"
import MarketingSettings from "@/components/profile/settings/MarketingSettings"
import NotificationPreferencesSettings from "@/components/profile/settings/NotificationPreferencesSettings"

const ProfileSettingsPage = () => {


    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            <ProfileInfoSettings />

            <AccountVerification />

            <NotificationPreferencesSettings />

            <MarketingSettings />

            <PasswordSettings />

            <ProfileTfaSettings />

            <SessionManagementSettings />
        </Accordion>
    )
}

export default ProfileSettingsPage
