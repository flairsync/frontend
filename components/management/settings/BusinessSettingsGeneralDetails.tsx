import React from 'react'

import { useState, useEffect, useRef } from "react"
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
import { checkSlugAvailabilityApiCall } from '@/features/business/service'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

type BusinessGeneralInfo = {
    name?: string,
    description?: string,
    email?: string,
    phone?: string,
    currency?: string,
    slug?: string,
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: BusinessGeneralInfo) => void,
    onTogglePublished?: (val: boolean) => void,
    onToggleAutoDisableOutOfStock?: (val: boolean) => void,
    disabled?: boolean,
    sectionRef?: (el: HTMLDivElement | null) => void,
    highlighted?: boolean,
}
const BusinessSettingsGeneralDetails = (props: Props) => {

    const [businessName, setBusinessName] = useState(props.businessDetails?.name)
    const [description, setDescription] = useState(props.businessDetails?.description)
    const [contactEmail, setContactEmail] = useState(props.businessDetails?.email)
    const [phone, setPhone] = useState(props.businessDetails?.phone);
    const [currency, setCurrency] = useState(toIsoCurrencyCode(props.businessDetails?.currency || "USD"));
    const [slug, setSlug] = useState(props.businessDetails?.slug ?? '')
    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

    const handleSlugChange = (value: string) => {
        const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        setSlug(normalized)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!normalized) {
            setSlugStatus('idle')
            return
        }
        if (!SLUG_REGEX.test(normalized)) {
            setSlugStatus('invalid')
            return
        }
        if (normalized === props.businessDetails?.slug) {
            setSlugStatus('idle')
            return
        }

        setSlugStatus('checking')
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await checkSlugAvailabilityApiCall(normalized, props.businessDetails!.id)
                setSlugStatus(res.available ? 'available' : 'taken')
            } catch {
                setSlugStatus('idle')
            }
        }, 500)
    }

    const onSaveDetails = () => {
        if (props.onSaveDetails) {
            props.onSaveDetails({
                description: description,
                email: contactEmail,
                name: businessName,
                phone: phone,
                currency: currency,
                slug: slug || undefined,
            })
        }
    }

    const canSave = slugStatus !== 'taken' && slugStatus !== 'checking' && slugStatus !== 'invalid'

    return (
        <AccordionItem
            value="general-info"
            ref={props.sectionRef}
            className={`border rounded-lg px-3 transition-all duration-700 ${props.highlighted ? "ring-2 ring-primary ring-offset-2 shadow-md" : ""}`}
        >
            <AccordionTrigger>General Information</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <Input
                    disabled={props.disabled}

                    placeholder="Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    maxLength={100}
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
                    <Label>Public URL Slug</Label>
                    <div className="relative">
                        <Input
                            disabled={props.disabled}
                            placeholder="your-restaurant-name"
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            className={
                                slugStatus === 'taken' || slugStatus === 'invalid'
                                    ? 'border-destructive pr-9'
                                    : slugStatus === 'available'
                                    ? 'border-green-500 pr-9'
                                    : 'pr-9'
                            }
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {slugStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                            {slugStatus === 'available' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {(slugStatus === 'taken' || slugStatus === 'invalid') && <XCircle className="h-4 w-4 text-destructive" />}
                        </span>
                    </div>
                    {slugStatus === 'taken' && <p className="text-xs text-destructive">This slug is already taken</p>}
                    {slugStatus === 'invalid' && <p className="text-xs text-destructive">Only lowercase letters, numbers, and hyphens allowed</p>}
                    {slugStatus === 'available' && <p className="text-xs text-green-600">Slug is available</p>}
                    {slugStatus === 'idle' && <p className="text-xs text-muted-foreground">Used in your public page URL. Lowercase letters, numbers, and hyphens only.</p>}
                    {!!props.businessDetails?.slug && slug !== props.businessDetails.slug && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            Changing the slug will break any shared links using the current one
                        </p>
                    )}
                </div>

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
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>Auto-Disable Out-of-Stock Items</Label>
                            <p className="text-xs text-muted-foreground">Automatically hide a menu item once its tracked stock hits zero, and bring it back once restocked</p>
                        </div>
                        <Switch
                            disabled={props.disabled}
                            checked={props.businessDetails?.autoDisableOutOfStock ?? false}
                            onCheckedChange={(val) => props.onToggleAutoDisableOutOfStock?.(val)}
                        />
                    </div>
                </div>

                <Button
                    disabled={props.disabled || !canSave}
                    onClick={onSaveDetails}>Save</Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsGeneralDetails