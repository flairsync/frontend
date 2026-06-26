import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Team } from "@/models/business/Team";
import { Trash2, UserPlus } from "lucide-react";

interface TeamRosterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team: Team | null;
    onOpenAssignStaff: () => void;
    onRemoveStaff: (employmentId: string) => void;
    isRemoving: boolean;
    removingId: string | null;
}

export const TeamRosterModal: React.FC<TeamRosterModalProps> = ({
    open,
    onOpenChange,
    team,
    onOpenAssignStaff,
    onRemoveStaff,
    isRemoving,
    removingId,
}) => {
    const { t } = useTranslation("management");

    if (!team) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader className="flex flex-row justify-between items-center pr-8">
                    <DialogTitle>{t("staff_teams.roster_modal.title", { name: team.name })}</DialogTitle>
                    <Button size="sm" onClick={onOpenAssignStaff}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t("staff_teams.roster_modal.add_staff")}
                    </Button>
                </DialogHeader>

                <div className="mt-4">
                    {team.members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/20">
                            {t("staff_teams.roster_modal.no_staff_assigned")}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("staff_teams.roster_modal.col_staff_member")}</TableHead>
                                        <TableHead>{t("staff_teams.roster_modal.col_email")}</TableHead>
                                        <TableHead className="w-[100px]">{t("staff_teams.roster_modal.col_actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {team.members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">
                                                {member.employment.professionalProfile?.displayName || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {member.employment.professionalProfile?.workEmail || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                    onClick={() => onRemoveStaff(member.employment.id)}
                                                    disabled={isRemoving}
                                                >
                                                    {isRemoving && removingId === member.employment.id ? (
                                                        t("staff_teams.roster_modal.removing")
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
