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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
import { Textarea } from "@/components/ui/textarea"
import { MyBusinessFullDetails } from '@/models/business/MyBusinessFullDetails'
import { toIsoCurrencyCode } from '@/utils/currency'

type BusinessGeneralInfo = {
    name?: string,
    description?: string,
    email?: string,
    phone?: string,
    currency?: string,
}

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: BusinessGeneralInfo) => void,
    onTogglePublished?: (val: boolean) => void,
    disabled?: boolean
}
const BusinessSettingsGeneralDetails = (props: Props) => {

    const [businessName, setBusinessName] = useState(props.businessDetails?.name)
    const [description, setDescription] = useState(props.businessDetails?.description)
    const [contactEmail, setContactEmail] = useState(props.businessDetails?.email)
    const [phone, setPhone] = useState(props.businessDetails?.phone);
    const [currency, setCurrency] = useState(toIsoCurrencyCode(props.businessDetails?.currency || "USD"));

    const onSaveDetails = () => {
        if (props.onSaveDetails) {
            props.onSaveDetails({
                description: description,
                email: contactEmail,
                name: businessName,
                phone: phone,
                currency: currency
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

                <div className="space-y-1.5 pt-2 border-t mt-4">
                    <Label>Currency</Label>
                    <Select disabled={props.disabled} value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="USD">US Dollar (USD $)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR €)</SelectItem>
                            <SelectItem value="GBP">British Pound (GBP £)</SelectItem>
                            <SelectItem value="TND">Tunisian Dinar (TND)</SelectItem>
                            <SelectItem value="AED">Emirati Dirham (AED)</SelectItem>
                            <SelectItem value="BRL">Brazilian Real (BRL R$)</SelectItem>
                            <SelectItem value="CAD">Canadian Dollar (CAD CA$)</SelectItem>
                            <SelectItem value="AUD">Australian Dollar (AUD AU$)</SelectItem>
                            <SelectItem value="JPY">Japanese Yen (JPY ¥)</SelectItem>
                            <SelectItem value="INR">Indian Rupee (INR ₹)</SelectItem>
                            <SelectItem value="CHF">Swiss Franc (CHF)</SelectItem>
                            <SelectItem value="SGD">Singapore Dollar (SGD SG$)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">This currency will be shown next to prices across your business.</p>
                </div>

                <div className="divide-y divide-border border-t mt-4">
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>Published</Label>
                            <p className="text-xs text-muted-foreground">Show this business to customers on the platform</p>
                        </div>
                        <Switch
                            disabled={props.disabled}
                            checked={props.businessDetails?.isPublished ?? false}
                            onCheckedChange={(val) => props.onTogglePublished?.(val)}
                        />
                    </div>
                </div>

                <Button
                    disabled={props.disabled}
                    onClick={onSaveDetails}>Save</Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsGeneralDetails