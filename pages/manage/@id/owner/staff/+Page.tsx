import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AddRoleModal } from "@/components/management/staff/AddNewRoleModal";

type StaffMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    workingToday: boolean;
    clockedIn: boolean;
};

type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
};

const availableRoles = ["Waiter", "Manager", "Chef", "Barista"];
const availablePermissions = [
    "Manage Orders",
    "View Reports",
    "Edit Menu",
    "Staff Scheduling",
];

const OwnerStaffManagementPage: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([
        {
            id: "1",
            name: "Alice Smith",
            email: "alice@example.com",
            role: "Manager",
            workingToday: true,
            clockedIn: true,
        },
        {
            id: "2",
            name: "Bob Johnson",
            email: "bob@example.com",
            role: "Waiter",
            workingToday: true,
            clockedIn: false,
        },
        {
            id: "3",
            name: "Charlie Brown",
            email: "charlie@example.com",
            role: "Barista",
            workingToday: false,
            clockedIn: false,
        },
    ]);

    const [roles, setRoles] = useState<Role[]>([
        {
            id: "r1",
            name: "Manager",
            description: "Full access to manage the restaurant",
            permissions: ["Manage Orders", "View Reports", "Edit Menu", "Staff Scheduling"],
        },
        {
            id: "r2",
            name: "Waiter",
            description: "Handle orders and serve customers",
            permissions: ["Manage Orders"],
        },
    ]);

    // Add Staff Modal State
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffRole, setNewStaffRole] = useState("Waiter");

    const addStaff = () => {
        if (!newStaffName || !newStaffEmail) return;
        const newMember: StaffMember = {
            id: Date.now().toString(),
            name: newStaffName,
            email: newStaffEmail,
            role: newStaffRole,
            workingToday: false,
            clockedIn: false,
        };
        setStaff([...staff, newMember]);
        setNewStaffName("");
        setNewStaffEmail("");
        setNewStaffRole("Waiter");
    };

    const removeStaff = (id: string) => {
        setStaff(staff.filter((s) => s.id !== id));
    };

    const updateRole = (id: string, role: string) => {
        setStaff(staff.map((s) => (s.id === id ? { ...s, role } : s)));
    };

    const addRole = () => {
        const newRole: Role = {
            id: Date.now().toString(),
            name: "New Role",
            description: "Describe this role...",
            permissions: [],
        };
        setRoles([...roles, newRole]);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Staff & Roles</h1>

                <Separator />

                <Tabs defaultValue="staff" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="staff">Staff Management</TabsTrigger>
                        <TabsTrigger value="roles">Roles Management</TabsTrigger>
                    </TabsList>

                    {/* Staff Management */}
                    <TabsContent value="staff" className="space-y-6">
                        {/* Analytics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Staff</CardTitle>
                                </CardHeader>
                                <CardContent>{staff.length}</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Today Working</CardTitle>
                                </CardHeader>
                                <CardContent>{staff.filter((s) => s.workingToday).length}</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Today Clocked In</CardTitle>
                                </CardHeader>
                                <CardContent>{staff.filter((s) => s.clockedIn).length}</CardContent>
                            </Card>
                            <Card className="flex items-center justify-center">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" /> Add Staff
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Staff</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input
                                                placeholder="Name"
                                                value={newStaffName}
                                                onChange={(e) => setNewStaffName(e.target.value)}
                                            />
                                            <Input
                                                placeholder="Email"
                                                value={newStaffEmail}
                                                onChange={(e) => setNewStaffEmail(e.target.value)}
                                            />
                                            <Select
                                                value={newStaffRole}
                                                onValueChange={(val) => setNewStaffRole(val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoles.map((role) => (
                                                        <SelectItem key={role} value={role}>
                                                            {role}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button onClick={addStaff}>Add</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </Card>
                        </div>

                        {/* Staff Table */}
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
                                            <TableHead>Role</TableHead>
                                            <TableHead>Working Today</TableHead>
                                            <TableHead>Clocked In</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staff.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>{member.name}</TableCell>
                                                <TableCell>{member.email}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(val) => updateRole(member.id, val)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableRoles.map((role) => (
                                                                <SelectItem key={role} value={role}>
                                                                    {role}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {member.workingToday ? "Yes" : "No"}
                                                </TableCell>
                                                <TableCell>
                                                    {member.clockedIn ? "Yes" : "No"}
                                                </TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => removeStaff(member.id)}
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
                    </TabsContent>

                    {/* Roles Management */}
                    <TabsContent value="roles" className="space-y-6">
                        <div className="flex justify-end">
                            <AddRoleModal />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Roles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Permissions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell>{role.name}</TableCell>
                                                <TableCell>{role.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {availablePermissions.map((perm) => (
                                                            <label key={perm} className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={role.permissions.includes(perm)}
                                                                    onChange={() => {
                                                                        setRoles((prev) =>
                                                                            prev.map((r) =>
                                                                                r.id === role.id
                                                                                    ? {
                                                                                        ...r,
                                                                                        permissions: r.permissions.includes(perm)
                                                                                            ? r.permissions.filter((p) => p !== perm)
                                                                                            : [...r.permissions, perm],
                                                                                    }
                                                                                    : r
                                                                            )
                                                                        );
                                                                    }}
                                                                />
                                                                {perm}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default OwnerStaffManagementPage;
