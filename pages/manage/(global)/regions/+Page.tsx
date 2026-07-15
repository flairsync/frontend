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
import { MapPinned, Store } from "lucide-react";
import { useRegions } from "@/features/regions/useRegions";
import { RegionExplainer } from "@/components/management/organizations/RegionExplainer";

const RegionsPage = () => {
    const { regions, loadingRegions, createRegion, isCreatingRegion } = useRegions();
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");

    const handleCreate = () => {
        if (!name.trim()) return;
        createRegion(name.trim(), {
            onSuccess: () => {
                setCreateOpen(false);
                setName("");
            },
        });
    };

    return (
        <div className="p-6 w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Regions</h1>
                <p className="text-muted-foreground mt-1">
                    Group a handful of branches under one regional manager — a region can stand on
                    its own, or link up to an organization later.
                </p>
            </div>

            <RegionExplainer />

            <div className="flex items-center justify-end">
                <Button onClick={() => setCreateOpen(true)} className="rounded-xl px-4 h-11 shrink-0">
                    + New Region
                </Button>
            </div>

            {loadingRegions && regions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-border rounded-xl bg-muted/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground font-medium">Loading your regions...</p>
                </div>
            ) : regions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regions.map((region) => (
                        <a key={region.id} href={`/manage/regions/${region.id}`}>
                            <Card className="hover:shadow-lg transition-all border border-border group overflow-hidden h-full">
                                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <MapPinned className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                        {region.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        {region.businessCount ?? 0} {region.businessCount === 1 ? "branch" : "branches"}
                                    </p>
                                </CardContent>
                            </Card>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl p-16 bg-muted/30">
                    <div className="bg-card p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-border">
                        <MapPinned className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-xl font-bold text-foreground mb-2">No regions yet</p>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                        Managing a cluster of branches? Create a region to group them, whether or not
                        they're part of a larger organization yet.
                    </p>
                    <Button className="rounded-xl shadow-md px-8 py-6 h-auto font-bold" onClick={() => setCreateOpen(true)}>
                        Create a Region
                    </Button>
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Region</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="region-name">Name</Label>
                        <Input
                            id="region-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Downtown Region"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!name.trim() || isCreatingRegion}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RegionsPage;
