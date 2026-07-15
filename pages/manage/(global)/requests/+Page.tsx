import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, Send, Check, X, Ban } from "lucide-react";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";
import { JoinRequest } from "@/features/join-requests/join-requests";

const describeNode = (type: "BUSINESS" | "REGION" | "ORGANIZATION") =>
    type === "BUSINESS" ? "Business" : type === "REGION" ? "Region" : "Organization";

const RequestRow: React.FC<{ request: JoinRequest; children?: React.ReactNode }> = ({ request, children }) => (
    <div className="flex items-center justify-between border border-border rounded-lg p-3 gap-3">
        <div className="min-w-0">
            <p className="text-sm font-medium truncate">
                {request.childName}{" "}
                <span className="text-muted-foreground">{request.action === "UNLINK" ? "→ leaving" : "→"}</span>{" "}
                {request.parentName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
                {describeNode(request.childType)} {request.action === "UNLINK" ? "leaving" : "joining"}{" "}
                {describeNode(request.parentType)} · {new Date(request.createdAt).toLocaleDateString()}
            </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <Badge
                variant={
                    request.status === "PENDING" ? "secondary" : request.status === "APPROVED" ? "default" : "outline"
                }
            >
                {request.status}
            </Badge>
            {children}
        </div>
    </div>
);

const RequestsPage = () => {
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

    return (
        <div className="p-6 w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Join requests</h1>
                <p className="text-muted-foreground mt-1">
                    Approve or decline requests to link with your businesses, regions, or organizations —
                    or track ones you've sent.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Inbox className="h-4 w-4" /> Incoming
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loadingIncoming ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                    ) : incoming.length > 0 ? (
                        incoming.map((r) => (
                            <RequestRow key={r.id} request={r}>
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
                            </RequestRow>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">Nothing waiting on you.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Send className="h-4 w-4" /> Sent by you
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loadingOutgoing ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                    ) : outgoing.length > 0 ? (
                        outgoing.map((r) => (
                            <RequestRow key={r.id} request={r}>
                                {r.status === "PENDING" && (
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
                            </RequestRow>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">You haven't sent any requests.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestsPage;
