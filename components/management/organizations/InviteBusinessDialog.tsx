import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Store } from "lucide-react";
import { usePlatformCountries } from "@/features/shared/usePlatformCountries";
import { joinRequestsApi, BusinessSearchResult, JoinRequestParentType } from "@/features/join-requests/join-requests";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";

interface InviteBusinessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentType: JoinRequestParentType;
    parentId: string;
    onLinked?: () => void;
}

export const InviteBusinessDialog: React.FC<InviteBusinessDialogProps> = ({
    open,
    onOpenChange,
    parentType,
    parentId,
    onLinked,
}) => {
    const { platformCountries, isCountriesLoading } = usePlatformCountries();
    const { sendJoinRequest, isSendingJoinRequest } = useJoinRequests();

    const [countryId, setCountryId] = useState<string>("");
    const [city, setCity] = useState("");
    const [name, setName] = useState("");
    const [results, setResults] = useState<BusinessSearchResult[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        if (!countryId) return;
        setSearching(true);
        try {
            const res = await joinRequestsApi.searchBusinesses(Number(countryId), city, name);
            setResults(res.businesses);
        } finally {
            setSearching(false);
        }
    };

    const handleInvite = (businessId: string) => {
        sendJoinRequest(
            { childType: "BUSINESS", childId: businessId, parentType, parentId },
            {
                onSuccess: () => {
                    setInvitedIds((prev) => new Set(prev).add(businessId));
                    onLinked?.();
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Find a business to invite</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Country</Label>
                            <Select value={countryId} onValueChange={setCountryId} disabled={isCountriesLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(platformCountries || []).map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>City (optional)</Label>
                            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Austin" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Business name (optional)</Label>
                        <div className="flex items-center gap-2">
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Search by name..." />
                            <Button onClick={handleSearch} disabled={!countryId || searching} className="shrink-0">
                                <Search className="h-4 w-4 mr-1.5" /> Search
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2 pt-1">
                        {searching ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">Searching...</p>
                        ) : results === null ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">
                                Pick a country and search to see matching businesses.
                            </p>
                        ) : results.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No businesses match those filters.</p>
                        ) : (
                            results.map((b) => {
                                const picture = b.media?.[0]?.url || b.logo || undefined;
                                const alreadyInvited = invitedIds.has(b.id);
                                return (
                                    <div key={b.id} className="flex items-start justify-between gap-3 border border-border rounded-lg p-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarImage src={picture} alt={b.name} />
                                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                                    {b.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{b.name}</p>
                                                    {b.alreadyLinked && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                                            Already linked
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {[b.city, b.state].filter(Boolean).join(", ") || "—"} · Added{" "}
                                                    {new Date(b.createdAt).toLocaleDateString()}
                                                </p>
                                                {b.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="shrink-0"
                                            disabled={isSendingJoinRequest || alreadyInvited || b.alreadyLinked}
                                            onClick={() => handleInvite(b.id)}
                                        >
                                            {alreadyInvited ? "Sent" : "Send request"}
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                        {results === null && (
                            <div className="flex items-center justify-center text-muted-foreground/50 py-2">
                                <Store className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
