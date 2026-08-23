import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
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
import { MyBusinessFullDetails } from '@/models/business/MyBusinessFullDetails'
import { PayPeriodType } from "@/models/business/shift/PayrollEntry"

type TipPoolStrategy = 'EQUAL_SPLIT' | 'HOURS_WEIGHTED'

type BusinessLaborInfo = {
    maxWeeklyHours?: number
    minGapBetweenShiftsHours?: number
    splitShiftGapHours?: number
    overtimeDailyThresholdHours?: number
    overtimeWeeklyThresholdHours?: number
    overtimeMultiplier?: number
    payPeriodType?: PayPeriodType
    tipPoolEnabled?: boolean
    tipPoolStrategy?: TipPoolStrategy
}

type Props = {
    businessDetails?: MyBusinessFullDetails
    onSaveDetails?: (data: BusinessLaborInfo) => void
    disabled?: boolean
}

const PAY_PERIOD_OPTIONS: PayPeriodType[] = ['WEEKLY', 'BIWEEKLY', 'MONTHLY']

const BusinessSettingsLabor = (props: Props) => {
    const { t } = useTranslation("management")
    const [maxWeeklyHours, setMaxWeeklyHours] = useState<number | undefined>(props.businessDetails?.maxWeeklyHours)
    const [minGapBetweenShiftsHours, setMinGapBetweenShiftsHours] = useState<number | undefined>(props.businessDetails?.minGapBetweenShiftsHours)
    const [splitShiftGapHours, setSplitShiftGapHours] = useState<number | undefined>(props.businessDetails?.splitShiftGapHours)
    const [overtimeDailyThresholdHours, setOvertimeDailyThresholdHours] = useState<number | undefined>(props.businessDetails?.overtimeDailyThresholdHours ?? 8)
    const [overtimeWeeklyThresholdHours, setOvertimeWeeklyThresholdHours] = useState<number | undefined>(props.businessDetails?.overtimeWeeklyThresholdHours ?? 40)
    const [overtimeMultiplier, setOvertimeMultiplier] = useState<number | undefined>(props.businessDetails?.overtimeMultiplier ?? 1.5)
    const [payPeriodType, setPayPeriodType] = useState<PayPeriodType>(props.businessDetails?.payPeriodType ?? 'WEEKLY')
    const [tipPoolEnabled, setTipPoolEnabled] = useState<boolean>(props.businessDetails?.tipPoolEnabled ?? false)
    const [tipPoolStrategy, setTipPoolStrategy] = useState<TipPoolStrategy>(props.businessDetails?.tipPoolStrategy ?? 'EQUAL_SPLIT')

    const onSaveDetails = () => {
        if (props.onSaveDetails) {
            props.onSaveDetails({
                maxWeeklyHours,
                minGapBetweenShiftsHours,
                splitShiftGapHours,
                overtimeDailyThresholdHours,
                overtimeWeeklyThresholdHours,
                overtimeMultiplier,
                payPeriodType,
                tipPoolEnabled,
                tipPoolStrategy,
            })
        }
    }

    return (
        <AccordionItem value="labor-compliance" className="border rounded-lg px-3">
            <AccordionTrigger>{t("settings_page.labor.trigger")}</AccordionTrigger>
            <AccordionContent className="py-2">
                <div className="divide-y divide-border">
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.max_weekly_hours.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.max_weekly_hours.desc")}</p>
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
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.min_gap.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.min_gap.desc")}</p>
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
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.split_shift_gap.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.split_shift_gap.desc")}</p>
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

                    <p className="pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("settings_page.labor.overtime_payroll_heading")}</p>

                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.daily_ot_threshold.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.daily_ot_threshold.desc")}</p>
                        </div>
                        <Input
                            disabled={props.disabled}
                            type="number"
                            className="w-24"
                            placeholder="e.g. 8"
                            value={overtimeDailyThresholdHours ?? ""}
                            onChange={(e) => setOvertimeDailyThresholdHours(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.weekly_ot_threshold.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.weekly_ot_threshold.desc")}</p>
                        </div>
                        <Input
                            disabled={props.disabled}
                            type="number"
                            className="w-24"
                            placeholder="e.g. 40"
                            value={overtimeWeeklyThresholdHours ?? ""}
                            onChange={(e) => setOvertimeWeeklyThresholdHours(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.overtime_multiplier.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.overtime_multiplier.desc")}</p>
                        </div>
                        <Input
                            disabled={props.disabled}
                            type="number"
                            step="0.1"
                            className="w-24"
                            placeholder="e.g. 1.5"
                            value={overtimeMultiplier ?? ""}
                            onChange={(e) => setOvertimeMultiplier(e.target.value ? Number(e.target.value) : undefined)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.pay_period_type.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.pay_period_type.desc")}</p>
                        </div>
                        <Select
                            disabled={props.disabled}
                            value={payPeriodType}
                            onValueChange={(v) => setPayPeriodType(v as PayPeriodType)}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAY_PERIOD_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {t(`settings_page.labor.pay_period_options.${opt}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("settings_page.labor.tip_pooling_heading")}</p>

                    <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                        <div className="space-y-0.5">
                            <Label>{t("settings_page.labor.enable_tip_pooling.label")}</Label>
                            <p className="text-xs text-muted-foreground">{t("settings_page.labor.enable_tip_pooling.desc")}</p>
                        </div>
                        <Switch
                            disabled={props.disabled}
                            checked={tipPoolEnabled}
                            onCheckedChange={(val) => setTipPoolEnabled(val)}
                        />
                    </div>
                    {tipPoolEnabled && (
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.labor.split_strategy.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.labor.split_strategy.desc")}</p>
                            </div>
                            <Select
                                disabled={props.disabled}
                                value={tipPoolStrategy}
                                onValueChange={(v) => setTipPoolStrategy(v as TipPoolStrategy)}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EQUAL_SPLIT">{t("settings_page.labor.split_strategy.equal_split")}</SelectItem>
                                    <SelectItem value="HOURS_WEIGHTED">{t("settings_page.labor.split_strategy.hours_worked")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <div className="pt-3">
                    <Button
                        disabled={props.disabled}
                        onClick={onSaveDetails}>{t("settings_page.labor.save")}</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export default BusinessSettingsLabor
