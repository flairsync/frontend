import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Store } from "lucide-react";
import { useOrganizations } from "@/features/organizations/useOrganizations";
import { OrganizationExplainer } from "@/components/management/organizations/OrganizationExplainer";

const OrganizationsPage = () => {
    const { organizations, loadingOrganizations, createOrganization, isCreatingOrganization } = useOrganizations();
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");

    const handleCreate = () => {
        if (!name.trim()) return;
        createOrganization(name.trim(), {
            onSuccess: () => {
                setCreateOpen(false);
                setName("");
            },
        });
    };

    return (
        <div className="p-6 w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Organizations</h1>
                <p className="text-muted-foreground mt-1">
                    Group your businesses to see combined sales, labor cost, and inventory alerts across
                    branches.
                </p>
            </div>

            <OrganizationExplainer />

            <div className="flex items-center justify-end">
                <Button onClick={() => setCreateOpen(true)} className="rounded-xl px-4 h-11 shrink-0">
                    + New Organization
                </Button>
            </div>

            {loadingOrganizations && organizations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border rounded-xl bg-muted/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground font-medium">Loading your organizations...</p>
                </div>
            ) : organizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map((org) => (
                        <a key={org.id} href={`/manage/organizations/${org.id}`}>
                            <Card className="hover:shadow-lg transition-all border border-border group overflow-hidden h-full">
                                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                        {org.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        {org.businessCount ?? 0} {org.businessCount === 1 ? "business" : "businesses"}
                                    </p>
                                </CardContent>
                            </Card>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
                    <div className="bg-card p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-border">
                        <Building2 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-xl font-bold text-foreground mb-2">No organizations yet</p>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                        If you own more than one business, group them into an organization to see combined performance.
                    </p>
                    <Button className="rounded-xl shadow-md px-8 py-6 h-auto font-bold" onClick={() => setCreateOpen(true)}>
                        Create an Organization
                    </Button>
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Organization</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="org-name">Name</Label>
                        <Input
                            id="org-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Restaurant Group"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!name.trim() || isCreatingOrganization}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrganizationsPage;
