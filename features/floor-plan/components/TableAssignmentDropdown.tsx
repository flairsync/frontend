import React from "react";
import { useTranslation } from "react-i18next";
import { useTables } from "@/features/floor-plan/useFloorPlan";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TableAssignmentDropdownProps {
    businessId: string;
    value: string;
    onChange: (value: string) => void;
    floorId?: string; // when set, only shows tables from this floor
}

export const TableAssignmentDropdown: React.FC<TableAssignmentDropdownProps> = ({ businessId, value, onChange, floorId }) => {
    const { t } = useTranslation("management");
    const { tables, fetchingTables } = useTables(businessId);

    if (fetchingTables) {
        return <div className="flex items-center gap-2 h-8 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> {t("floor_plan_designer.table_assignment.loading")}</div>;
    }

    const filtered = floorId ? tables?.filter((t: any) => t.floorId === floorId) : tables;

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={t("floor_plan_designer.table_assignment.unassigned")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">{t("floor_plan_designer.table_assignment.none_decor")}</SelectItem>
                {filtered?.map((table: any) => (
                    <SelectItem key={table.id} value={table.id}>
                        {table.name} (#{table.number})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
