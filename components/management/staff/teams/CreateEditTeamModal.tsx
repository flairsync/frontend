import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
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
    const { register, handleSubmit, reset } = useForm<{
        name: string;
        colorCode: string;
    }>({
        defaultValues: {
            name: team?.name || "",
            colorCode: team?.colorCode || "#000000",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: team?.name || "",
                colorCode: team?.colorCode || "#000000",
            });
        }
    }, [open, team, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{team ? "Edit Team" : "Create New Team"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            {...register("name", { required: true })}
                            placeholder="e.g. Kitchen Staff"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="colorCode">Team Color</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="colorCode"
                                type="color"
                                className="w-16 h-10 p-1 cursor-pointer"
                                {...register("colorCode")}
                            />
                            <span className="text-sm text-muted-foreground">Select a color to identify this team</span>
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
