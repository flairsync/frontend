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

const ProfileSettingsPage = () => {


    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Profile Info */}

            <ProfileInfoSettings />

            {/* Password */}

            <PasswordSettings />

            {/* 2FA */}
            <ProfileTfaSettings />

            {/* Marketing */}

        </Accordion>
    )
}

export default ProfileSettingsPage
