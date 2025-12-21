import React from 'react'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslation } from "react-i18next"
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
import { Textarea } from "@/components/ui/textarea"
import { MyBusinessFullDetails } from '@/models/business/MyBusinessFullDetails'

type BusinessGeneralInfo = {
    name?: string,
    description?: string,
    email?: string,
    phone?: string,
}

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: BusinessGeneralInfo) => void,
    disabled?: boolean
}
const BusinessSettingsGeneralDetails = (props: Props) => {

    const [businessName, setBusinessName] = useState(props.businessDetails?.name)
    const [description, setDescription] = useState(props.businessDetails?.description)
    const [contactEmail, setContactEmail] = useState(props.businessDetails?.email)
    const [phone, setPhone] = useState(props.businessDetails?.phone);

    const onSaveDetails = () => {
        if (props.onSaveDetails) {
            props.onSaveDetails({
                description: description,
                email: contactEmail,
                name: businessName,
                phone: phone
            })
        }
    }

    return (
        <AccordionItem value="general-info" className="border rounded-lg px-3">
            <AccordionTrigger>General Information</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <Input
                    disabled={props.disabled}

                    placeholder="Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    maxLength={20}
                />
                <Textarea
                    disabled={props.disabled}

                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Input
                    disabled={props.disabled}

                    placeholder="Contact Email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                />
                <Input
                    disabled={props.disabled}

                    placeholder="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <Button
                    disabled={props.disabled}
                    onClick={onSaveDetails}>Save</Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsGeneralDetails