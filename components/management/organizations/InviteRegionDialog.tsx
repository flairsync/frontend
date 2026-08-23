import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPinned, Store } from "lucide-react";
import { joinRequestsApi, RegionSearchResult } from "@/features/join-requests/join-requests";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";

interface InviteRegionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    onLinked?: () => void;
}

export const InviteRegionDialog: React.FC<InviteRegionDialogProps> = ({
    open,
    onOpenChange,
    organizationId,
    onLinked,
}) => {
    const { t } = useTranslation("management");
    const { sendJoinRequest, isSendingJoinRequest } = useJoinRequests();

    const [name, setName] = useState("");
    const [results, setResults] = useState<RegionSearchResult[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        setSearching(true);
        try {
            const res = await joinRequestsApi.searchRegions(name);
            setResults(res.regions);
        } finally {
            setSearching(false);
        }
    };

    const handleInvite = (regionId: string) => {
        sendJoinRequest(
            { childType: "REGION", childId: regionId, parentType: "ORGANIZATION", parentId: organizationId },
            {
                onSuccess: () => {
                    setInvitedIds((prev) => new Set(prev).add(regionId));
                    onLinked?.();
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("invite_region_dialog.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("invite_region_dialog.search_placeholder")} />
                        <Button onClick={handleSearch} disabled={searching} className="shrink-0">
                            <Search className="h-4 w-4 mr-1.5" /> {t("invite_business_dialog.search")}
                        </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2 pt-1">
                        {searching ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">{t("invite_business_dialog.searching")}</p>
                        ) : results === null ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">{t("invite_region_dialog.search_hint")}</p>
                        ) : results.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">{t("invite_region_dialog.no_matches")}</p>
                        ) : (
                            results.map((r) => {
                                const alreadyInvited = invitedIds.has(r.id);
                                return (
                                    <div key={r.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <MapPinned className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{r.name}</p>
                                                    {r.alreadyLinked && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                                            {t("invite_business_dialog.already_linked")}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Store className="h-3 w-3" /> {t("invite_region_dialog.branch_count", { count: r.businessCount })}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="shrink-0"
                                            disabled={isSendingJoinRequest || alreadyInvited || r.alreadyLinked}
                                            onClick={() => handleInvite(r.id)}
                                        >
                                            {alreadyInvited ? t("invite_business_dialog.sent") : t("invite_business_dialog.send_request")}
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
