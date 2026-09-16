import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import DataPagination from "@/components/inputs/DataPagination";
import { LoyaltyHistoryList } from "@/components/loyalty/LoyaltyHistoryList";
import { useLoyaltyMemberHistory } from "@/features/loyalty/useLoyaltyMembers";
import { LoyaltyMember } from "@/features/loyalty/loyalty-api";

const LIMIT = 10;

type LoyaltyMemberHistoryDialogProps = {
    businessId: string;
    member: LoyaltyMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function LoyaltyMemberHistoryDialog({ businessId, member, open, onOpenChange }: LoyaltyMemberHistoryDialogProps) {
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (open) setPage(1);
    }, [open, member?.userId]);

    const { data: history, isFetching } = useLoyaltyMemberHistory(businessId, member?.userId, page, LIMIT);
    const memberName = member ? [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email : "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Points History — {memberName}</DialogTitle>
                </DialogHeader>

                {isFetching && !history ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <LoyaltyHistoryList entries={history?.data ?? []} />
                        {history && history.pages > 1 && (
                            <DataPagination
                                current={page}
                                total={history.pages * LIMIT}
                                pageSize={LIMIT}
                                onChange={setPage}
                            />
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
