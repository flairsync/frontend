import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, UserPlus, Edit, Plus, EditIcon, CalendarPlus, AlertCircle, Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessEmployeeOps } from "@/features/business/employment/useBusinessEmployeeOps";
import { Badge } from "@/components/ui/badge";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";
import { EditStaffRolesModal } from "@/components/management/staff/EditStaffRolesModal";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { IndividualScheduleModal } from '@/components/management/schedule/IndividualScheduleModal';
import { EditStaffSettingsModal } from "@/components/management/staff/EditStaffSettingsModal";

interface EditableHourlyRateProps {
  employeeId: string;
  initialRate: number;
  onSave: (rate: number) => void;
  isUpdating?: boolean;
}

const EditableHourlyRate = ({
  employeeId,
  initialRate,
  onSave,
  isUpdating,
}: EditableHourlyRateProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rate, setRate] = useState(initialRate.toString());

  const handleSave = () => {
    const numRate = parseFloat(rate);
    if (!isNaN(numRate)) {
      onSave(numRate);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setRate(initialRate.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-20 h-8 p-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave} disabled={isUpdating}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={handleCancel} disabled={isUpdating}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span
        className="cursor-pointer hover:underline decoration-dotted"
        onClick={() => setIsEditing(true)}
      >
        {initialRate > 0 ? `${initialRate}€` : "0€"}
      </span>
      {(!initialRate || initialRate === 0) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>no hourly rate added</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <EditIcon className="h-3 w-3" />
      </Button>
    </div>
  );
};

const StaffSection = () => {
  // Add Staff Modal State
  const {
    routeParams
  } = usePageContext();
  const {
    currentPage,
    employees,
    isPending,
    totalPages,
    setPage
  } = useBusinessEmployees(routeParams.id);

  const {
    businessRoles,
    loadingBusinessRoles,
    createNewRole,
    creatingNewRole,
    updateEmployeeRoles
  } = useBusinessRoles(routeParams.id);

  const {
    resyncInvitations,
    updateHourlyRate,
    updatingHourlyRate,
    updateEmployeeSettings,
  } = useBusinessEmployeeOps(routeParams.id);

  const [selectedStaff, setSelectedStaff] = useState<BusinessEmployee | null>(null);
  const [editingSettingsStaff, setEditingSettingsStaff] = useState<BusinessEmployee | null>(null);

  // Individual Schedule State
  const [scheduleStaffId, setScheduleStaffId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <div>

      {selectedStaff && (
        <EditStaffRolesModal
          onSave={(roles => {
            updateEmployeeRoles({
              roles: roles,
              employmentId: selectedStaff.id
            })
          })}
          roles={businessRoles}
          staff={selectedStaff}
          open={Boolean(selectedStaff)}
          onOpenChange={open => !open && setSelectedStaff(null)}
        />
      )}

      {editingSettingsStaff && (
        <EditStaffSettingsModal
          staff={editingSettingsStaff}
          open={Boolean(editingSettingsStaff)}
          onOpenChange={open => !open && setEditingSettingsStaff(null)}
          onSave={(settings) => {
             updateEmployeeSettings({
                 employeeId: editingSettingsStaff.id,
                 settings: settings
             })
          }}
        />
      )}

      {isScheduleModalOpen && (
        <IndividualScheduleModal 
          open={isScheduleModalOpen} 
          onOpenChange={setIsScheduleModalOpen}
          defaultEmploymentId={scheduleStaffId}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle>All Staff</CardTitle>

          <div className="flex gap-2">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  resyncInvitations();
                }}
              >Re-Sync invitations</Button>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.professionalProfile?.displayName}</TableCell>
                  <TableCell>{member.professionalProfile?.workEmail}</TableCell>
                  <TableCell>
                    {member.type === 'OWNER' ? (
                      <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">Business Owner</Badge>
                    ) : (
                      <StaffRolesCell
                        roles={member.roles}
                        onEdit={() => {
                          setSelectedStaff(member)
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <EditableHourlyRate
                      employeeId={member.id}
                      initialRate={member.hourlyRate}
                      onSave={(rate) => updateHourlyRate({ employeeId: member.id, hourlyRate: rate })}
                      isUpdating={updatingHourlyRate}
                    />
                  </TableCell>
                  <TableCell>
                    {member.status}
                  </TableCell>

                  <TableCell className="flex gap-2">
                    {member.type !== 'OWNER' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Schedule Shift"
                          onClick={() => {
                            setScheduleStaffId(member.id);
                            setIsScheduleModalOpen(true);
                          }}
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSettingsStaff(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


    </div>
  )
}

export default StaffSection



type Props = {
  roles: { role: { id: string; name: string } }[];
  onEdit: () => void;
};

export function StaffRolesCell({ roles, onEdit }: Props) {
  const visibleRoles = roles.slice(0, 2);
  const hiddenCount = roles.length - visibleRoles.length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="icon"
        variant="ghost"
        className="ml-1"
        onClick={onEdit}
      >
        <EditIcon className="h-4 w-4" />
      </Button>
      {
        roles.length == 0 && <Badge key={"no_roles_chip"} variant="secondary">
          No roles yet
        </Badge>
      }
      {visibleRoles.map(r => (
        <Badge key={r.role.id} variant="secondary">
          {r.role.name}
        </Badge>
      ))}

      {hiddenCount > 0 && (
        <Badge variant="outline">+{hiddenCount}</Badge>
      )}


    </div>
  );
}

