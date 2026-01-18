import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";
import { usePlatformPermissions } from "@/features/shared/usePlatformPermissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Role } from "@/models/business/roles/Role";
import StaffSection from "./StaffSection";
import RolesSection from "./RolesSection";
import InvitationsSection from "./InvitationsSection";



const OwnerStaffManagementPage: React.FC = () => {
    const {
        i18n
    } = useTranslation();

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Staff & Roles</h1>

                <Separator />

                <Tabs defaultValue="staff" className="space-y-6">
                    <TabsList className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto scrollbar-none">
                        <TabsTrigger value="staff" className="flex-1 sm:flex-none min-w-[120px] text-center">
                            Staff Management
                        </TabsTrigger>
                        <TabsTrigger value="invitations" className="flex-1 sm:flex-none min-w-[120px] text-center">
                            Staff Invitations
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex-1 sm:flex-none min-w-[120px] text-center">
                            Roles Management
                        </TabsTrigger>
                    </TabsList>

                    {/* Staff Management */}
                    <TabsContent value="staff" className="space-y-6">
                        <StaffSection />
                    </TabsContent>


                    {/* Staff Management */}
                    <TabsContent value="invitations" className="space-y-6">
                        <InvitationsSection />
                    </TabsContent>

                    {/* Roles Management */}
                    <TabsContent value="roles" className="space-y-6">
                        <RolesSection />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default OwnerStaffManagementPage;
