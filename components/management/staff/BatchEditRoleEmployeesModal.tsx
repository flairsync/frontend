import { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { Role } from "@/models/business/roles/Role";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
    open: boolean;
    role?: Role;
    businessId: string;
    onOpenChange: (open: boolean) => void;
};

export function BatchEditRoleEmployeesModal({ open, role, businessId, onOpenChange }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    
    // We fetch employees. For a large business we might need to search the API, 
    // but for now we'll use the first page of employees or a larger limit if possible.
    const { employees, isPending: loadingEmployees } = useBusinessEmployees(businessId);
    const { updateEmployeeRoles } = useBusinessRoles(businessId);

    // Track which employees have this role
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open && role && employees) {
            const initialSelected = new Set(
                employees
                    .filter(emp => emp.roles.some(r => r.role.id === role.id))
                    .map(emp => emp.id)
            );
            setSelectedEmployeeIds(initialSelected);
            setSearch("");
        }
    }, [open, role, employees]);

    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        if (!search.trim()) return employees;
        
        const lowerSearch = search.toLowerCase();
        return employees.filter(emp => {
            const name = emp.professionalProfile?.displayName?.toLowerCase() || "";
            const email = emp.professionalProfile?.workEmail?.toLowerCase() || "";
            return name.includes(lowerSearch) || email.includes(lowerSearch);
        });
    }, [employees, search]);

    const toggleEmployee = (employeeId: string) => {
        setSelectedEmployeeIds(prev => {
            const next = new Set(prev);
            if (next.has(employeeId)) {
                next.delete(employeeId);
            } else {
                next.add(employeeId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (!role || !employees) return;
        setIsSaving(true);

        try {
            // We need to figure out which employees to update.
            // A realistic implementation would send a diff or batch update API. 
            // Here, we update each employee whose role status changed.
            const promises = employees.map(emp => {
                const hadRole = emp.roles.some(r => r.role.id === role.id);
                const hasRoleNow = selectedEmployeeIds.has(emp.id);

                if (hadRole !== hasRoleNow) {
                    // Reconstruct their roles array
                    const currentRoleIds = emp.roles.map(r => r.role.id);
                    const newRoleIds = hasRoleNow 
                        ? [...currentRoleIds, role.id] 
                        : currentRoleIds.filter(id => id !== role.id);

                    updateEmployeeRoles({ employmentId: emp.id, roles: newRoleIds }, {
                    onSuccess: () => {
                        // Success handling if needed
                    }
                });
                }
            });

            // If we had mutateAsync, wait for all.
            onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Employees - {role?.name}</DialogTitle>
                    <DialogDescription>
                        Assign or remove employees from this role.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-1 mt-4 h-[400px] border rounded-md p-2">
                    {loadingEmployees ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No employees found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredEmployees.map(emp => (
                                <div 
                                    key={emp.id}
                                    className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                                    onClick={() => toggleEmployee(emp.id)}
                                >
                                    <Checkbox 
                                        checked={selectedEmployeeIds.has(emp.id)}
                                        onCheckedChange={() => toggleEmployee(emp.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1 flex flex-col leading-none">
                                        <span className="text-sm font-medium">
                                            {emp.professionalProfile?.displayName || "Unnamed"}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {emp.professionalProfile?.workEmail}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || loadingEmployees}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
