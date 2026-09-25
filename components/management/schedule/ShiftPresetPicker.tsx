import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShiftTemplates } from "@/features/shifts/useShiftTemplates";
import { ShiftTemplate } from "@/models/business/shift/ShiftTemplate";

/** Templates come back from a Postgres `time` column, so "08:00:00" — `<input type="time">` wants "08:00". */
export const toTimeInputValue = (value: string) => (value || "").slice(0, 5);

/**
 * `useQuery`'s generic doesn't currently survive into consumers anywhere in this repo
 * (`NoInfer<TQueryFnData>`), so the list is narrowed once here instead of every caller
 * poking at an untyped value.
 */
export const asPresetList = (templates: unknown): ShiftTemplate[] =>
    Array.isArray(templates) ? (templates as ShiftTemplate[]) : [];

interface ShiftPresetPickerProps {
    businessId: string;
    /** Called with HH:mm values, ready to drop straight into a time input. */
    onApply: (startTime: string, endTime: string) => void;
}

/**
 * Fills the start/end time fields of whatever form it sits in from a saved preset.
 *
 * Presets used to be reachable only from the two bulk-scheduling modals, which made
 * them look like a feature with no purpose — you'd create "Morning 08:00–16:00" and
 * then never see it again in the form you actually schedule from. This puts them in
 * the single-shift and recurring-rule forms too. It only ever writes into the form's
 * own fields; no preset reference is stored on the shift.
 */
export const ShiftPresetPicker: React.FC<ShiftPresetPickerProps> = ({ businessId, onApply }) => {
    const { t } = useTranslation("management");
    const { templates, fetchingTemplates } = useShiftTemplates(businessId);
    const presets = asPresetList(templates);
    const hasPresets = presets.length > 0;

    return (
        <div className="space-y-1.5 rounded-md border border-dashed bg-muted/20 p-3">
            <Label className="text-xs font-semibold">{t("shift_preset_picker.label")}</Label>
            {hasPresets ? (
                <>
                    <Select
                        value=""
                        onValueChange={(id) => {
                            const preset = presets.find((tpl) => tpl.id === id);
                            if (preset) onApply(toTimeInputValue(preset.startTime), toTimeInputValue(preset.endTime));
                        }}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue
                                placeholder={fetchingTemplates ? t("shift_preset_picker.loading") : t("shift_preset_picker.placeholder")}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {presets.map((tpl) => (
                                <SelectItem key={tpl.id} value={tpl.id}>
                                    {tpl.name} ({toTimeInputValue(tpl.startTime)} – {toTimeInputValue(tpl.endTime)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">{t("shift_preset_picker.hint")}</p>
                </>
            ) : (
                <p className="text-[10px] text-muted-foreground">{t("shift_preset_picker.empty_hint")}</p>
            )}
        </div>
    );
};

export default ShiftPresetPicker;
