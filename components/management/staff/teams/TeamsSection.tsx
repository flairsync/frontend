import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Users, Trash2 } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessTeams } from "@/features/business/team/useBusinessTeams";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { Team } from "@/models/business/Team";

import { CreateEditTeamModal } from "./CreateEditTeamModal";
import { TeamRosterModal } from "./TeamRosterModal";
import { AssignStaffModal } from "./AssignStaffModal";

const TeamsSection = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const {
        teams,
        loadingTeams,
        createTeam,
        creatingTeam,
        updateTeam,
        updatingTeam,
        deleteTeam,
        deletingTeam,
        assignStaff,
        assigningStaff,
        removeStaff,
        removingStaff,
    } = useBusinessTeams(businessId);

    // We need all employees to be able to assign them
    const { employees, isPending: loadingEmployees } = useBusinessEmployees(businessId);

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [rosterTeam, setRosterTeam] = useState<Team | null>(null);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    // Handlers for Create / Update Team
    const handleSaveTeam = async (data: { name: string; colorCode?: string }) => {
        try {
            if (selectedTeam) {
                await updateTeam({ teamId: selectedTeam.id, payload: data });
            } else {
                await createTeam(data);
            }
            setIsCreateModalOpen(false);
            setSelectedTeam(null);
        } catch (e) {
            console.error("Failed to save team", e);
        }
    };

    // Handlers for Assignment
    const handleAssignStaff = async (selectedIds: string[]) => {
        if (!rosterTeam) return;
        try {
            // Run assignments sequentially or in Promise.all 
            // depending on backend support, assuming individual calls per endpoint design
            await Promise.all(
                selectedIds.map(id => assignStaff({ teamId: rosterTeam.id, employmentId: id }))
            );

            setIsAssignModalOpen(false);
            // Let Tanstack query refetch update the rosterTeam by relying on data from `teams` if needed
            // Or we can manually close the roster modal temporarily
        } catch (error) {
            console.error("Failed to assign staff", error);
        }
    };

    const handleRemoveStaff = async (employmentId: string) => {
        if (!rosterTeam) return;
        setRemovingId(employmentId);
        try {
            await removeStaff({ teamId: rosterTeam.id, employmentId });
        } catch (error) {
            console.error("Failed to remove staff", error);
        } finally {
            setRemovingId(null);
        }
    };

    if (loadingTeams) {
        return <div>Loading teams...</div>;
    }

    // To keep roster team modal updated after mutation refetches
    const currentRosterTeam = teams?.find(t => t.id === rosterTeam?.id) || rosterTeam;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Teams Management</h2>
                <Button onClick={() => {
                    setSelectedTeam(null);
                    setIsCreateModalOpen(true);
                }}>
                    Create Team
                </Button>
            </div>

            {teams && teams.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
                        <Users className="w-12 h-12 opacity-20" />
                        <div>
                            <p className="text-lg font-medium text-foreground">No teams found</p>
                            <p>Create groups to manage your staff easily.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams?.map((team) => (
                        <Card key={team.id} className="relative overflow-hidden flex flex-col">
                            <div
                                className="absolute top-0 left-0 w-full h-2"
                                style={{ backgroundColor: team.colorCode || '#ccc' }}
                            />
                            <CardHeader className="pt-6 pb-2">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="truncate pr-2">{team.name}</span>
                                    <div className="flex bg-muted rounded-full px-2 py-1 items-center gap-1 text-sm text-muted-foreground shrink-0">
                                        <Users className="w-4 h-4" />
                                        <span>{team.members?.length || 0}</span>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-end mt-4">
                                <div className="flex justify-between items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setRosterTeam(team);
                                            setIsRosterModalOpen(true);
                                        }}
                                    >
                                        View Roster
                                    </Button>
                                    <div className="flex items-center shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setIsCreateModalOpen(true);
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this team?")) {
                                                    deleteTeam(team.id);
                                                }
                                            }}
                                            disabled={deletingTeam}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateEditTeamModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                team={selectedTeam}
                onSubmit={handleSaveTeam}
                isLoading={creatingTeam || updatingTeam}
                onDelete={(teamId) => {
                    if (confirm("Are you sure you want to delete this team?")) {
                        deleteTeam(teamId);
                        setIsCreateModalOpen(false);
                        setSelectedTeam(null);
                    }
                }}
            />

            <TeamRosterModal
                open={isRosterModalOpen}
                onOpenChange={(v) => {
                    setIsRosterModalOpen(v);
                    if (!v) setRosterTeam(null);
                }}
                team={currentRosterTeam}
                onOpenAssignStaff={() => setIsAssignModalOpen(true)}
                onRemoveStaff={handleRemoveStaff}
                isRemoving={removingStaff}
                removingId={removingId}
            />

            {currentRosterTeam && employees && (
                <AssignStaffModal
                    open={isAssignModalOpen}
                    onOpenChange={setIsAssignModalOpen}
                    staffList={employees}
                    assignedStaffIds={(currentRosterTeam.members || []).map(m => m.employment.id)}
                    onAssign={handleAssignStaff}
                    isAssigning={assigningStaff}
                />
            )}
        </div>
    );
};

export default TeamsSection;
