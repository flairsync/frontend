import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox, Check, X, Ban } from "lucide-react";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";
import { JoinRequest } from "@/features/join-requests/join-requests";

interface RequestsPanelProps {
    entityType: "ORGANIZATION" | "REGION";
    entityId: string;
}

// Shows only the join requests relevant to this specific organization/region,
// pending ones only — full history (approved/declined/cancelled) still lives
// in the global /manage/requests inbox, this is just the actionable subset
// surfaced where you're already looking.
export const RequestsPanel: React.FC<RequestsPanelProps> = ({ entityType, entityId }) => {
    const {
        incoming,
        loadingIncoming,
        outgoing,
        loadingOutgoing,
        approveJoinRequest,
        isApprovingJoinRequest,
        declineJoinRequest,
        isDecliningJoinRequest,
        cancelJoinRequest,
        isCancellingJoinRequest,
    } = useJoinRequests();

    const isRelevant = (r: JoinRequest) => {
        if (entityType === "ORGANIZATION") {
            return r.parentType === "ORGANIZATION" && r.parentId === entityId;
        }
        // A region can be the parent (inviting/receiving businesses) or the
        // child (requesting/receiving an invite from an organization).
        return (r.parentType === "REGION" && r.parentId === entityId) || (r.childType === "REGION" && r.childId === entityId);
    };

    if (loadingIncoming || loadingOutgoing) return null;

    const relevantIncoming = incoming.filter(isRelevant);
    const incomingIds = new Set(relevantIncoming.map((r) => r.id));

    const merged = new Map<string, JoinRequest>();
    outgoing.filter(isRelevant).forEach((r) => merged.set(r.id, r));
    relevantIncoming.forEach((r) => merged.set(r.id, r));

    const requests = Array.from(merged.values())
        .filter((r) => r.status === "PENDING")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (requests.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Inbox className="h-4 w-4" /> Pending requests
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {requests.map((r) => {
                    const needsMyApproval = incomingIds.has(r.id);
                    return (
                        <div key={r.id} className="flex items-center justify-between border border-border rounded-lg p-3 gap-3">
                            <p className="text-sm font-medium min-w-0 truncate">
                                {r.childName}{" "}
                                <span className="text-muted-foreground">
                                    {r.action === "UNLINK" ? "wants to leave" : "wants to join"}
                                </span>{" "}
                                {r.parentName}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                                {needsMyApproval ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-destructive hover:text-destructive"
                                            disabled={isDecliningJoinRequest}
                                            onClick={() => declineJoinRequest(r.id)}
                                        >
                                            <X className="h-3.5 w-3.5 mr-1" /> Decline
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8"
                                            disabled={isApprovingJoinRequest}
                                            onClick={() => approveJoinRequest(r.id)}
                                        >
                                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 text-muted-foreground"
                                        disabled={isCancellingJoinRequest}
                                        onClick={() => cancelJoinRequest(r.id)}
                                    >
                                        <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
