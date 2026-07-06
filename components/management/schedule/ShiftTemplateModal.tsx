import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { ShiftTemplate } from "@/models/business/shift/ShiftTemplate";
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
            startTime: template?.startTime || "09:00",
            endTime: template?.endTime || "17:00",
            colorCode: template?.colorCode || "#000000",
        },
        onSubmit,
    });

    useEffect(() => {
        if (open) formik.resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template ? t("schedule_modals.shift_template.edit_title") : t("schedule_modals.shift_template.create_title")}</DialogTitle>
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
