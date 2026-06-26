import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { Team } from "@/models/business/Team";

interface CreateEditTeamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team?: Team | null;
    onSubmit: (data: { name: string; colorCode?: string }) => void;
    isLoading: boolean;
    onDelete?: (id: string) => void;
}

export const CreateEditTeamModal: React.FC<CreateEditTeamModalProps> = ({
    open,
    onOpenChange,
    team,
    onSubmit,
    isLoading,
    onDelete,
}) => {
    const { t } = useTranslation("management");
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: team?.name || "",
            colorCode: team?.colorCode || "#000000",
        },
        onSubmit,
    });

    useEffect(() => {
        if (open) formik.resetForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{team ? t("staff_teams.edit_modal.edit_title") : t("staff_teams.edit_modal.create_title")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("staff_teams.edit_modal.name_label")}</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            placeholder={t("staff_teams.edit_modal.name_placeholder")}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="colorCode">{t("staff_teams.edit_modal.color_label")}</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="colorCode"
                                name="colorCode"
                                type="color"
                                className="w-16 h-10 p-1 cursor-pointer"
                                value={formik.values.colorCode}
                                onChange={formik.handleChange}
                            />
                            <span className="text-sm text-muted-foreground">{t("staff_teams.edit_modal.color_hint")}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {team && onDelete && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete(team.id)}
                                >
                                    {t("staff_teams.edit_modal.delete")}
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                {t("staff_teams.edit_modal.cancel")}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? t("staff_teams.edit_modal.saving") : t("staff_teams.edit_modal.save")}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
