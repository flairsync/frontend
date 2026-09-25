import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { ShiftTemplate } from "@/models/business/shift/ShiftTemplate";
import { toTimeInputValue } from "./ShiftPresetPicker";
import { useTranslation } from "react-i18next";

interface ShiftTemplateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template?: ShiftTemplate | null;
    onSubmit: (data: { name: string; startTime: string; endTime: string; colorCode?: string }) => void;
    isLoading: boolean;
    onDelete?: (id: string) => void;
}

export const ShiftTemplateModal: React.FC<ShiftTemplateModalProps> = ({
    open,
    onOpenChange,
    template,
    onSubmit,
    isLoading,
    onDelete,
}) => {
    const { t } = useTranslation("management");
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: template?.name || "",
            startTime: toTimeInputValue(template?.startTime || "") || "09:00",
            endTime: toTimeInputValue(template?.endTime || "") || "17:00",
            colorCode: template?.colorCode || "#000000",
        },
        onSubmit,
    });

    useEffect(() => {
        if (open) formik.resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Live length feedback, so a typo like 09:00–07:00 reads as "22h 0m, ends next day"
    // instead of silently saving an overnight preset nobody meant to create.
    const duration = (() => {
        const [sh, sm] = formik.values.startTime.split(':').map(Number);
        const [eh, em] = formik.values.endTime.split(':').map(Number);
        if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return null;
        const minutes = ((eh * 60 + em) - (sh * 60 + sm) + 24 * 60) % (24 * 60);
        return { hours: Math.floor(minutes / 60), minutes: minutes % 60, overnight: eh * 60 + em < sh * 60 + sm };
    })();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? t("schedule_modals.shift_template.edit_title") : t("schedule_modals.shift_template.create_title")}</DialogTitle>
                    <DialogDescription>{t("schedule_modals.shift_template.description")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("schedule_modals.shift_template.name_label")}</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            placeholder={t("schedule_modals.shift_template.name_placeholder")}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">{t("schedule_modals.shift_template.start_time_label")}</Label>
                            <Input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formik.values.startTime}
                                onChange={formik.handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">{t("schedule_modals.shift_template.end_time_label")}</Label>
                            <Input
                                id="endTime"
                                name="endTime"
                                type="time"
                                value={formik.values.endTime}
                                onChange={formik.handleChange}
                                required
                            />
                        </div>
                    </div>
                    {duration && (
                        <p className="text-xs text-muted-foreground">
                            {t("schedule_modals.shift_template.duration_summary", { hours: duration.hours, minutes: duration.minutes })}
                            {duration.overnight && ` — ${t("schedule_modals.shift_template.overnight_note")}`}
                        </p>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="colorCode">{t("schedule_modals.shift_template.color_label")}</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="colorCode"
                                name="colorCode"
                                type="color"
                                className="w-16 h-10 p-1 cursor-pointer"
                                value={formik.values.colorCode}
                                onChange={formik.handleChange}
                            />
                            <span className="text-sm text-muted-foreground">{t("schedule_modals.shift_template.color_hint")}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {template && onDelete && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete(template.id)}
                                >
                                    {t("schedule_modals.shift_template.delete")}
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                {t("schedule_modals.shift_template.cancel")}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? t("schedule_modals.shift_template.saving") : t("schedule_modals.shift_template.save")}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
