import React, { useEffect } from 'react'

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

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: {
        openHours: OpeningHours[],
        autoOpen: boolean
    }) => void,
    disabled?: boolean
}
const BusinessSettingsOpenPeriods = (props: Props) => {

    const [autoOpen, setAutoOpen] = useState(false);
    const [openHours, setOpenHours] = useState<OpeningHours[]>();
    useEffect(() => {
        setOpenHours(props.businessDetails?.openingHours)

    }, [props.businessDetails]);

    const onSaveDetails = () => {
        console.log(openHours);
        if (props.onSaveDetails && openHours) {
            props.onSaveDetails({
                openHours,
                autoOpen
            })
        }

    }

    return (
        <AccordionItem value="open-periods" className="border rounded-lg px-3">
            <AccordionTrigger>Open periods</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">

                <div className="flex items-center justify-between mb-3">

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={autoOpen}
                                    onCheckedChange={(checked) => {
                                        setAutoOpen(checked);
                                    }}
                                />
                                <span className="text-sm text-gray-600">
                                    Auto open business
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>When enabled, the business will be marked as open automatically on start time</p>
                        </TooltipContent>
                    </Tooltip>


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