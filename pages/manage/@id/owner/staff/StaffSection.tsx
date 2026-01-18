import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, UserPlus, Edit, Plus } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessEmployeeOps } from "@/features/business/employment/useBusinessEmployeeOps";
import { Form, Formik } from "formik";
import { inviteNewEmployeeSchema } from "@/misc/FormValidators";
import { InputError } from "@/components/inputs/InputError";


const StaffSection = () => {
  // Add Staff Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
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
    inviteNewEmployee,
    invitingNewEmployee
  } = useBusinessEmployeeOps(routeParams.id);


  return (
    <div>

      <div className="flex justify-end">
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild >
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
            </DialogHeader>

            <Formik
              initialValues={{ email: '', }}
              validationSchema={inviteNewEmployeeSchema}
              onSubmit={values => {
                inviteNewEmployee(values.email)
                setInviteModalOpen(false);
              }}
            >
              {({ errors, touched, handleChange, values }) => (
                <Form className="space-y-4 mt-2">
                  <Input
                    placeholder="Email"
                    value={values.email}
                    name="email"
                    id="email"
                    onChange={handleChange}
                  />
                  <InputError
                    message={errors.email}
                  />
                  <Button type="submit" >Add</Button>
                </Form>)}
            </Formik>

          </DialogContent>
        </Dialog>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
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