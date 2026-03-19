import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { ShiftTemplate } from "@/models/business/shift/ShiftTemplate";

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
    const { register, handleSubmit, reset } = useForm<{
        name: string;
        startTime: string;
        endTime: string;
        colorCode: string;
    }>({
        defaultValues: {
            name: template?.name || "",
            startTime: template?.startTime || "09:00",
            endTime: template?.endTime || "17:00",
            colorCode: template?.colorCode || "#000000",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: template?.name || "",
                startTime: template?.startTime || "09:00",
                endTime: template?.endTime || "17:00",
                colorCode: template?.colorCode || "#000000",
            });
        }
    }, [open, template, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{template ? "Edit Shift Template" : "Create New Template"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            {...register("name", { required: true })}
                            placeholder="e.g. Morning Shift"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                {...register("startTime", { required: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                {...register("endTime", { required: true })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="colorCode">Template Color</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="colorCode"
                                type="color"
                                className="w-16 h-10 p-1 cursor-pointer"
                                {...register("colorCode")}
                            />
                            <span className="text-sm text-muted-foreground">Select a color to identify this template</span>
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
                                    Delete
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
