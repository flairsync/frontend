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
import { getCurrencySymbol, toIsoCurrencyCode } from '@/utils/currency'
import { checkSlugAvailabilityApiCall } from '@/features/business/service'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

// AD-04 gap fix: countries whose legally mandated primary receipt language can't be
// overridden away (Catalan for Andorra, per Llei 6/2024 — see
// countryReceiptLanguageDefault in the backend's src/business/receipt-language.ts, which
// this mirrors). For these, receiptLanguage is not shown as a free-choice selector at all —
// only an optional secondary language alongside the fixed primary.
const MANDATED_RECEIPT_LANGUAGE: Record<string, { code: string; name: string }> = {
    AD: { code: "ca", name: "Català" },
}

type BusinessGeneralInfo = {
    name?: string,
    description?: string,
    email?: string,
    phone?: string,
    currency?: string,
    slug?: string,
    receiptLanguage?: string,
    receiptSecondaryLanguage?: string | null,
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
    const { t } = useTranslation("management");

    const [businessName, setBusinessName] = useState(props.businessDetails?.name)
    const [description, setDescription] = useState(props.businessDetails?.description)
    const [contactEmail, setContactEmail] = useState(props.businessDetails?.email)
    const [phone, setPhone] = useState(props.businessDetails?.phone);
    const [receiptLanguage, setReceiptLanguage] = useState(props.businessDetails?.receiptLanguage || "en");
    const [receiptSecondaryLanguage, setReceiptSecondaryLanguage] = useState<string | null>(
        props.businessDetails?.receiptSecondaryLanguage ?? null,
    )
    const mandatedReceiptLanguage = props.businessDetails?.country?.code
        ? MANDATED_RECEIPT_LANGUAGE[props.businessDetails.country.code]
        : undefined
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
                slug: slug || undefined,
                receiptLanguage: receiptLanguage,
                // AD-04 gap fix: for a mandated-language country, receiptLanguage above is
                // ignored server-side entirely — this is the field that actually matters,
                // and null explicitly clears a previously-set secondary language.
                receiptSecondaryLanguage: mandatedReceiptLanguage ? receiptSecondaryLanguage : undefined,
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
            <AccordionTrigger>{t("settings_page.general_details.trigger")}</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <Input
                    disabled={props.disabled}

                    placeholder={t("settings_page.general_details.business_name_placeholder")}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    maxLength={100}
                />
                <Textarea
                    disabled={props.disabled}

                    placeholder={t("settings_page.general_details.description_placeholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Input
                    disabled={props.disabled}

                    placeholder={t("settings_page.general_details.contact_email_placeholder")}
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                />
                <Input
                    disabled={props.disabled}

                    placeholder={t("settings_page.general_details.phone_placeholder")}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <div className="space-y-1.5 pt-2 border-t mt-4">
                    <Label>{t("settings_page.general_details.slug.label")}</Label>
                    <div className="relative">
                        <Input
                            disabled={props.disabled}
                            placeholder={t("settings_page.general_details.slug.placeholder")}
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
                    {slugStatus === 'taken' && <p className="text-xs text-destructive">{t("settings_page.general_details.slug.taken")}</p>}
                    {slugStatus === 'invalid' && <p className="text-xs text-destructive">{t("settings_page.general_details.slug.invalid")}</p>}
                    {slugStatus === 'available' && <p className="text-xs text-green-600">{t("settings_page.general_details.slug.available")}</p>}
                    {slugStatus === 'idle' && <p className="text-xs text-muted-foreground">{t("settings_page.general_details.slug.idle_hint")}</p>}
                    {!!props.businessDetails?.slug && slug !== props.businessDetails.slug && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {t("settings_page.general_details.slug.change_warning")}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5 pt-2 border-t mt-4">
                    <Label>{t("settings_page.general_details.currency.label")}</Label>
                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <span className="font-medium">
                            {toIsoCurrencyCode(props.businessDetails?.currency)} ({getCurrencySymbol(props.businessDetails?.currency)})
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {t("settings_page.general_details.currency.set_by", { country: props.businessDetails?.country?.name || t("settings_page.general_details.currency.set_by_fallback") })}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t("settings_page.general_details.currency.hint")}
                    </p>
                </div>

                {mandatedReceiptLanguage ? (
                    <div className="space-y-1.5 pt-2 border-t mt-4">
                        <Label>{t("settings_page.general_details.receipt_language.label")}</Label>
                        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                            <span className="font-medium">{mandatedReceiptLanguage.name}</span>
                            <span className="text-xs text-muted-foreground">{t("settings_page.general_details.receipt_language.required_by_law")}</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <Label className="text-xs text-muted-foreground">{t("settings_page.general_details.receipt_language.secondary_label")}</Label>
                            <Select
                                disabled={props.disabled}
                                value={receiptSecondaryLanguage ?? "none"}
                                onValueChange={(v) => setReceiptSecondaryLanguage(v === "none" ? null : v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t("settings_page.general_details.receipt_language.none_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t("settings_page.general_details.receipt_language.none_option", { language: mandatedReceiptLanguage.name })}</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("settings_page.general_details.receipt_language.mandated_hint", { language: mandatedReceiptLanguage.name })}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1.5 pt-2 border-t mt-4">
                        <Label>{t("settings_page.general_details.receipt_language.label")}</Label>
                        <Select disabled={props.disabled} value={receiptLanguage} onValueChange={setReceiptLanguage}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("settings_page.general_details.receipt_language.select_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="ca">Català</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {t("settings_page.general_details.receipt_language.hint")}
                        </p>
                    </div>
                )}

                <div className="divide-y divide-border border-t mt-4">
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.general_details.published.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.general_details.published.desc")}</p>
                        </div>
                        <Switch
                            disabled={props.disabled}
                            checked={props.businessDetails?.isPublished ?? false}
                            onCheckedChange={(val) => props.onTogglePublished?.(val)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.general_details.auto_disable_out_of_stock.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.general_details.auto_disable_out_of_stock.desc")}</p>
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
                    onClick={onSaveDetails}>{t("settings_page.general_details.save")}</Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsGeneralDetails