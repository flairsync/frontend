import React from "react";
import { useTables } from "@/features/floor-plan/useFloorPlan";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TableAssignmentDropdownProps {
    businessId: string;
    value: string;
    onChange: (value: string) => void;
}

export const TableAssignmentDropdown: React.FC<TableAssignmentDropdownProps> = ({ businessId, value, onChange }) => {
    const { tables, fetchingTables } = useTables(businessId);

    if (fetchingTables) {
        return <div className="flex items-center gap-2 h-8 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Loading tables...</div>;
    }

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">None / Decor</SelectItem>
                {tables?.map((table: any) => (
                    <SelectItem key={table.id} value={table.id}>
                        {table.name} ({table.number})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
