import React from "react";
import { useTranslation } from "react-i18next";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { AttendanceLifecycleStatus, AttendanceStatus } from "@/models/business/shift/Attendance";

interface AttendanceFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  lifecycleFilter: AttendanceLifecycleStatus | "all";
  setLifecycleFilter: (val: AttendanceLifecycleStatus | "all") => void;
  statusFilter: AttendanceStatus | "all";
  setStatusFilter: (val: AttendanceStatus | "all") => void;
}

const AttendanceFilters = ({
  dateRange,
  setDateRange,
  employeeFilter,
  setEmployeeFilter,
  lifecycleFilter,
  setLifecycleFilter,
  statusFilter,
  setStatusFilter,
}: AttendanceFiltersProps) => {
  const { t } = useTranslation("management");
  const isDirty = employeeFilter || lifecycleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-card p-4 rounded-xl border-none shadow-sm flex-wrap">
      <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-[280px]" />

      <Select value={lifecycleFilter} onValueChange={(v) => setLifecycleFilter(v as any)}>
        <SelectTrigger className="w-[180px] bg-muted border-none h-10">
          <SelectValue placeholder={t("attendance_filters.all_lifecycles")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("attendance_filters.all_lifecycles")}</SelectItem>
          <SelectItem value="ONGOING">{t("attendance_filters.lifecycle_active")}</SelectItem>
          <SelectItem value="FINISHED">{t("attendance_filters.lifecycle_pending_validation")}</SelectItem>
          <SelectItem value="VALIDATED">{t("attendance_filters.lifecycle_validated")}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <SelectTrigger className="w-[160px] bg-muted border-none h-10">
          <SelectValue placeholder={t("attendance_filters.all_statuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("attendance_filters.all_statuses")}</SelectItem>
          <SelectItem value="PRESENT">{t("attendance_filters.status_present")}</SelectItem>
          <SelectItem value="LATE">{t("attendance_filters.status_late")}</SelectItem>
          <SelectItem value="NO_SHOW">{t("attendance_filters.status_no_show")}</SelectItem>
          <SelectItem value="ON_BREAK">{t("attendance_filters.status_on_break")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={t("attendance_filters.search_employee_placeholder")}
          className="pl-9 bg-muted border-none h-10"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
        />
      </div>

      {isDirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEmployeeFilter("");
            setLifecycleFilter("all");
            setStatusFilter("all");
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          {t("attendance_filters.clear")}
        </Button>
      )}
    </div>
  );
};

export default AttendanceFilters;
