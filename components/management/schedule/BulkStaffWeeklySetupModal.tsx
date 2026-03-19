import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useShiftTemplates } from "@/features/shifts/useShiftTemplates";
import { useShifts } from "@/features/shifts/useShifts";
import { usePageContext } from "vike-react/usePageContext";
import { Trash } from "lucide-react";

interface BulkStaffWeeklySetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const BulkStaffWeeklySetupModal: React.FC<BulkStaffWeeklySetupModalProps> = ({ open, onOpenChange }) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { employees: allEmployees, isPending: fetchingEmployees } = useBusinessEmployees(businessId);
    const employees = allEmployees?.filter(emp => emp.type !== 'OWNER') || [];
    const { templates, fetchingTemplates } = useShiftTemplates(businessId);
    const { bulkStaffWeeklySetup, isBulkStaffScheduling } = useShifts(businessId);

    const [employmentId, setEmploymentId] = useState<string>("");
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
        if (!employmentId || dates.length === 0) return;
        if (useTemplate && !templateId) return;

        bulkStaffWeeklySetup({
            employmentId,
            ...(useTemplate ? { templateId } : { startTime, endTime }),
            dates: dates.map(d => ({ date: d }))
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setDates([]);
                setEmploymentId("");
                setTemplateId("");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Staff Shift Setup</DialogTitle>
                    <DialogDescription>Assign multiple shifts to a specific staff member across different dates.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Select Staff Member</Label>
                        <Select value={employmentId} onValueChange={setEmploymentId}>
                            <SelectTrigger>
                                <SelectValue placeholder={fetchingEmployees ? "Loading employees..." : "Choose an employee"} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees?.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                         {emp.professionalProfile?.displayName || emp.professionalProfile?.firstName || 'Unnamed Staff'}
                                    </SelectItem>
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
                        <Button type="submit" disabled={isBulkStaffScheduling || !employmentId || dates.length === 0 || (useTemplate && !templateId)}>
                            {isBulkStaffScheduling ? "Scheduling..." : "Schedule Staff"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
