import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { MyBusinessFullDetails } from '@/models/business/MyBusinessFullDetails'
import { AuditLogHint } from "@/components/audit/AuditLogHint"

type BusinessLaborInfo = {
    maxWeeklyHours?: number,
    minGapBetweenShiftsHours?: number,
    splitShiftGapHours?: number,
}

type Props = {
    businessDetails?: MyBusinessFullDetails,
    onSaveDetails?: (data: BusinessLaborInfo) => void,
    disabled?: boolean
}

const BusinessSettingsLabor = (props: Props) => {
    const [maxWeeklyHours, setMaxWeeklyHours] = useState<number | undefined>(props.businessDetails?.maxWeeklyHours);
    const [minGapBetweenShiftsHours, setMinGapBetweenShiftsHours] = useState<number | undefined>(props.businessDetails?.minGapBetweenShiftsHours);
    const [splitShiftGapHours, setSplitShiftGapHours] = useState<number | undefined>(props.businessDetails?.splitShiftGapHours);

    const onSaveDetails = () => {
        if (props.onSaveDetails) {
            props.onSaveDetails({
                maxWeeklyHours,
                minGapBetweenShiftsHours,
                splitShiftGapHours,
            })
        }
    }

    return (
        <AccordionItem value="labor-compliance" className="border rounded-lg px-3">
            <AccordionTrigger className="flex items-center gap-2">
                <span>Labor & Compliance Defaults</span>
                <AuditLogHint
                    entityType="business"
                    entityId={props.businessDetails?.id}
                    businessId={props.businessDetails?.id}
                />
            </AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Max Weekly Hours</Label>
                        <p className="text-xs text-muted-foreground">Default max hours per employee before blocking schedule</p>
                    </div>
                    <Input
                        disabled={props.disabled}
                        type="number"
                        className="w-24"
                        placeholder="e.g. 40"
                        value={maxWeeklyHours ?? ""}
                        onChange={(e) => setMaxWeeklyHours(e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Min Gap Between Shifts (Hours)</Label>
                        <p className="text-xs text-muted-foreground">The "clopening" gap, e.g. 8 hours</p>
                    </div>
                    <Input
                        disabled={props.disabled}
                        type="number"
                        className="w-24"
                        placeholder="e.g. 8"
                        value={minGapBetweenShiftsHours ?? ""}
                        onChange={(e) => setMinGapBetweenShiftsHours(e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Split Shift Gap (Hours)</Label>
                        <p className="text-xs text-muted-foreground">Minimum gap allowable on the same day</p>
                    </div>
                    <Input
                        disabled={props.disabled}
                        type="number"
                        className="w-24"
                        placeholder="e.g. 1"
                        value={splitShiftGapHours ?? ""}
                        onChange={(e) => setSplitShiftGapHours(e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>

                <Button
                    disabled={props.disabled}
                    onClick={onSaveDetails}>Save</Button>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsLabor
