import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Store } from "lucide-react";
import { joinRequestsApi, OrganizationSearchResult } from "@/features/join-requests/join-requests";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";

interface JoinOrganizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    regionId: string;
    onLinked?: () => void;
}

export const JoinOrganizationDialog: React.FC<JoinOrganizationDialogProps> = ({
    open,
    onOpenChange,
    regionId,
    onLinked,
}) => {
    const { sendJoinRequest, isSendingJoinRequest } = useJoinRequests();

    const [name, setName] = useState("");
    const [results, setResults] = useState<OrganizationSearchResult[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        setSearching(true);
        try {
            const res = await joinRequestsApi.searchOrganizations(name);
            setResults(res.organizations);
        } finally {
            setSearching(false);
        }
    };

    const handleRequest = (organizationId: string) => {
        sendJoinRequest(
            { childType: "REGION", childId: regionId, parentType: "ORGANIZATION", parentId: organizationId },
            {
                onSuccess: () => {
                    setRequestedIds((prev) => new Set(prev).add(organizationId));
                    onLinked?.();
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Find an organization to join</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Search by organization name..." />
                        <Button onClick={handleSearch} disabled={searching} className="shrink-0">
                            <Search className="h-4 w-4 mr-1.5" /> Search
                        </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2 pt-1">
                        {searching ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">Searching...</p>
                        ) : results === null ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">Search to see matching organizations.</p>
                        ) : results.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No organizations match that name.</p>
                        ) : (
                            results.map((o) => {
                                const alreadyRequested = requestedIds.has(o.id);
                                return (
                                    <div key={o.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Building2 className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{o.name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Store className="h-3 w-3" /> {o.businessCount} {o.businessCount === 1 ? "branch" : "branches"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="shrink-0"
                                            disabled={isSendingJoinRequest || alreadyRequested}
                                            onClick={() => handleRequest(o.id)}
                                        >
                                            {alreadyRequested ? "Sent" : "Send request"}
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
