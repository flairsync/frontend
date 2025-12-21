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
import WorkHoursSelector, { WorkHours } from '../create/WorkHoursSelector'

type BusinessGeneralInfo = {
    name?: string,
    description?: string,
    email?: string,
    phone?: string,
}

// to do update the type
const initialHours: WorkHours = {
    monday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    tuesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    wednesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    thursday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    friday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    saturday: { isClosed: true, shifts: [] },
    sunday: { isClosed: true, shifts: [] },
};

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: BusinessGeneralInfo) => void,
    disabled?: boolean
}
const BusinessSettingsOpenPeriods = (props: Props) => {



    return (
        <AccordionItem value="open-periods" className="border rounded-lg px-3">
            <AccordionTrigger>Work periods</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <WorkHoursSelector
                    value={initialHours}
                    onChange={(newValue) => {
                        // setFieldValue("workTimes", newValue);
                    }}
                />
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsOpenPeriods