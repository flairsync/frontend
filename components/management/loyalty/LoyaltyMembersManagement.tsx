import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Coins, TrendingUp, Pencil, History } from "lucide-react";
import DataPagination from "@/components/inputs/DataPagination";
import { useLoyaltyMembers, useLoyaltyStats, useAdjustLoyaltyPoints } from "@/features/loyalty/useLoyaltyMembers";
import { LoyaltyMember } from "@/features/loyalty/loyalty-api";
import { AdjustLoyaltyPointsDialog } from "./AdjustLoyaltyPointsDialog";
import { LoyaltyMemberHistoryDialog } from "./LoyaltyMemberHistoryDialog";

const LIMIT = 10;

function StatTile({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className="flex-1 min-w-[140px] p-4 rounded-lg border">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
    );
}

type LoyaltyMembersManagementProps = {
    businessId: string;
    canUpdate: boolean;
};

export function LoyaltyMembersManagement({ businessId, canUpdate }: LoyaltyMembersManagementProps) {
    const [page, setPage] = useState(1);
    const [adjustingMember, setAdjustingMember] = useState<LoyaltyMember | null>(null);
    const [viewingHistoryMember, setViewingHistoryMember] = useState<LoyaltyMember | null>(null);

    const { data: stats, isFetching: fetchingStats } = useLoyaltyStats(businessId);
    const { data: membersPage, isFetching: fetchingMembers } = useLoyaltyMembers(businessId, page, LIMIT);
    const { mutateAsync: adjustPoints, isPending: isAdjusting } = useAdjustLoyaltyPoints(businessId);

    // History is a read action (always available to whoever can see this list
    // at all, since fetching the list itself already required LOYALTY:read) —
    // only the Adjust button is gated on canUpdate specifically.
    const hasActionsColumn = true;
    const members = membersPage?.data ?? [];

    const handleConfirmAdjust = async (userId: string, delta: number, note?: string) => {
        try {
            await adjustPoints({ userId, delta, note });
            setAdjustingMember(null);
        } catch {
            // toast already shown by the mutation's onError
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Loyalty Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                    {fetchingStats && !stats ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="flex-1 min-w-[140px] h-24 rounded-lg" />
                        ))
                    ) : (
                        <>
                            <StatTile label="Members" value={stats?.memberCount ?? 0} icon={Users} color="bg-primary/10 text-primary" />
                            <StatTile label="Points Outstanding" value={stats?.pointsOutstanding ?? 0} icon={Coins} color="bg-amber-500/10 text-amber-600" />
                            <StatTile label="Points Issued" value={stats?.pointsIssued ?? 0} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
                        </>
                    )}
                </div>

                <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold">Email</TableHead>
                                    <TableHead className="font-semibold">Balance</TableHead>
                                    <TableHead className="font-semibold">Joined</TableHead>
                                    {hasActionsColumn && <TableHead className="text-right font-semibold">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fetchingMembers && !membersPage ? (
                                    <TableRow>
                                        <TableCell colSpan={hasActionsColumn ? 5 : 4} className="text-center py-10 text-muted-foreground animate-pulse">
                                            Loading members...
                                        </TableCell>
                                    </TableRow>
                                ) : members.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={hasActionsColumn ? 5 : 4} className="text-center py-10 text-muted-foreground">
                                            No one has joined this loyalty program yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((member) => (
                                        <TableRow key={member.userId} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-medium">
                                                {[member.firstName, member.lastName].filter(Boolean).join(" ") || "—"}
                                            </TableCell>
                                            <TableCell>{member.email ?? "—"}</TableCell>
                                            <TableCell className="font-mono">{member.balance} pts</TableCell>
                                            <TableCell>{new Date(member.enrolledAt).toLocaleDateString()}</TableCell>
                                            {hasActionsColumn && (
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setViewingHistoryMember(member)}
                                                        title="View history"
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </Button>
                                                    {canUpdate && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => setAdjustingMember(member)}
                                                            title="Adjust points"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {membersPage && (
                    <DataPagination
                        current={page}
                        total={membersPage.pages * LIMIT}
                        pageSize={LIMIT}
                        onChange={setPage}
                    />
                )}
            </CardContent>

            <AdjustLoyaltyPointsDialog
                open={!!adjustingMember}
                onOpenChange={(open) => !open && setAdjustingMember(null)}
                member={adjustingMember}
                onConfirm={handleConfirmAdjust}
                isAdjusting={isAdjusting}
            />

            <LoyaltyMemberHistoryDialog
                businessId={businessId}
                member={viewingHistoryMember}
                open={!!viewingHistoryMember}
                onOpenChange={(open) => !open && setViewingHistoryMember(null)}
            />
        </Card>
    );
}
