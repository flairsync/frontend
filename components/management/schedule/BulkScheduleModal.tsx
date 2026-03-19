import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessTeams } from "@/features/business/team/useBusinessTeams";
import { useShiftTemplates } from "@/features/shifts/useShiftTemplates";
import { useShifts } from "@/features/shifts/useShifts";
import { usePageContext } from "vike-react/usePageContext";
import { Trash } from "lucide-react";

interface BulkScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const BulkScheduleModal: React.FC<BulkScheduleModalProps> = ({ open, onOpenChange }) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { teams, loadingTeams } = useBusinessTeams(businessId);
    const { templates, fetchingTemplates } = useShiftTemplates(businessId);
    const { bulkScheduleTeam, isBulkScheduling } = useShifts(businessId);

    const [teamId, setTeamId] = useState<string>("");
    const [useTemplate, setUseTemplate] = useState<boolean>(true);
    const [templateId, setTemplateId] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("17:00");
    
    // Dates
    const [dateInput, setDateInput] = useState<string>("");
    const [dates, setDates] = useState<string[]>([]);

    const handleAddDate = () => {
        if (dateInput && !dates.includes(dateInput)) {
            setDates([...dates, dateInput].sort());
            setDateInput("");
        }
    };

    const handleRemoveDate = (d: string) => {
        setDates(dates.filter(date => date !== d));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId || dates.length === 0) return;
        if (useTemplate && !templateId) return;

        bulkScheduleTeam({
            teamId,
            ...(useTemplate ? { templateId } : { startTime, endTime }),
            dates: dates.map(d => ({ date: d }))
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setDates([]);
                setTeamId("");
                setTemplateId("");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Schedule Team</DialogTitle>
                    <DialogDescription>Assign shifts to all active employees in a team across multiple dates.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Select Team</Label>
                        <Select value={teamId} onValueChange={setTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingTeams ? "Loading teams..." : "Choose a team"} />
                            </SelectTrigger>
                            <SelectContent>
                                {teams?.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>Shift Time</Label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input 
                                    type="radio" 
                                    checked={useTemplate} 
                                    onChange={() => setUseTemplate(true)} 
                                />
                                Use Template
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input 
                                    type="radio" 
                                    checked={!useTemplate} 
                                    onChange={() => setUseTemplate(false)} 
                                />
                                Custom Time
                            </label>
                        </div>
                        
                        {useTemplate ? (
                            <Select value={templateId} onValueChange={setTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingTemplates ? "Loading templates..." : "Choose a template"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.startTime} - {t.endTime})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Start</Label>
                                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">End</Label>
                                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 border-t pt-2">
                        <Label>Dates to Schedule</Label>
                        <div className="flex gap-2">
                            <Input 
                                type="date" 
                                value={dateInput} 
                                onChange={e => setDateInput(e.target.value)} 
                            />
                            <Button type="button" onClick={handleAddDate} variant="secondary">Add</Button>
                        </div>
                        {dates.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                                {dates.map(d => (
                                    <div key={d} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                                        <span>{d}</span>
                                        <button type="button" onClick={() => handleRemoveDate(d)} className="text-muted-foreground hover:text-foreground">
                                            <Trash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isBulkScheduling || !teamId || dates.length === 0 || (useTemplate && !templateId)}>
                            {isBulkScheduling ? "Scheduling..." : "Schedule Team"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
