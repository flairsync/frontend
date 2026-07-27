import React, { useEffect } from 'react'

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { MyBusinessFullDetails, OpeningHours } from '@/models/business/MyBusinessFullDetails'
import WorkHoursSelector from '../create/WorkHoursSelector'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"


type BusinessGeneralInfo = {
    name?: string,
    description?: string,
    email?: string,
    phone?: string,
}

// to do update the type
/* const initialHours: WorkHours = {
    monday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    tuesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    wednesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    thursday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    friday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    saturday: { isClosed: true, shifts: [] },
    sunday: { isClosed: true, shifts: [] },
}; */

type BusinessStatusValue = "auto" | "open" | "closed";

const STATUS_OPTIONS: { value: BusinessStatusValue; label: string; description: string }[] = [
    { value: "auto", label: "Auto", description: "Open/closed follows your opening hours below" },
    { value: "open", label: "Force open", description: "Always shows as open, regardless of hours" },
    { value: "closed", label: "Force closed", description: "Always shows as closed, regardless of hours" },
]

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: {
        openHours: OpeningHours[],
    }) => void,
    onSaveStatus?: (status: BusinessStatusValue) => void,
    disabled?: boolean,
    savingStatus?: boolean,
}
const BusinessSettingsOpenPeriods = (props: Props) => {

    const [status, setStatus] = useState<BusinessStatusValue>("auto");
    const [openHours, setOpenHours] = useState<OpeningHours[]>();
    useEffect(() => {
        setOpenHours(props.businessDetails?.openingHours)
        if (props.businessDetails?.status) {
            setStatus(props.businessDetails.status as BusinessStatusValue);
        }
    }, [props.businessDetails]);

    const onSaveDetails = () => {
        if (props.onSaveDetails && openHours) {
            props.onSaveDetails({
                openHours,
            })
        }

    }

    const onStatusChange = (value: BusinessStatusValue) => {
        setStatus(value);
        props.onSaveStatus?.(value);
    }

    return (
        <AccordionItem value="open-periods" className="border rounded-lg px-3">
            <AccordionTrigger>Open periods</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">

                <div className="space-y-2 mb-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-sm font-medium text-muted-foreground">Business status</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Auto marks the business open/closed based on the opening hours below. Force open/closed overrides that until changed again.</p>
                        </TooltipContent>
                    </Tooltip>
                    <div className="inline-flex rounded-lg border p-1 gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                type="button"
                                size="sm"
                                variant={status === opt.value ? "default" : "ghost"}
                                disabled={props.savingStatus}
                                onClick={() => onStatusChange(opt.value)}
                                className="rounded-md"
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {STATUS_OPTIONS.find((opt) => opt.value === status)?.description}
                    </p>
                </div>
                <WorkHoursSelector
                    hideTitle
                    value={openHours}
                    onChange={(newValue) => {
                        setOpenHours(newValue);
                    }}
                />
                <Button
                    disabled={props.disabled}
                    onClick={onSaveDetails}>Save</Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsOpenPeriods