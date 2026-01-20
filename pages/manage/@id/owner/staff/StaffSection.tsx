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
import { Trash, UserPlus, Edit, Plus, EditIcon } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessEmployeeOps } from "@/features/business/employment/useBusinessEmployeeOps";
import { Badge } from "@/components/ui/badge";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";
import { EditStaffRolesModal } from "@/components/management/staff/EditStaffRolesModal";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";


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
    resyncInvitations
  } = useBusinessEmployeeOps(routeParams.id);

  const [selectedStaff, setSelectedStaff] = useState<BusinessEmployee | null>(null);


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
                    <StaffRolesCell
                      roles={member.roles}
                      onEdit={() => {
                        setSelectedStaff(member)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {member.status}
                  </TableCell>

                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
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

