import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useReservations } from "@/features/reservations/useReservations";
import { getAvailableActions } from "@/features/reservations/reservationUtils";
import { CheckCircle, XCircle, Armchair, Flag, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ReservationActionButtonsProps {
    businessId: string;
    reservation: any;
    onActionComplete?: () => void;
    size?: "sm" | "default";
    variant?: "inline" | "stacked";
}

export const ReservationActionButtons: React.FC<ReservationActionButtonsProps> = ({
    businessId,
    reservation,
    onActionComplete,
    size = "sm",
    variant = "inline",
}) => {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const {
        updateReservation,
        isUpdatingReservation,
        cancelReservation,
        isCancellingReservation,
        markNoShow,
        isMarkingNoShow,
    } = useReservations(businessId);

    const actions = getAvailableActions(reservation?.status);

    const handleTransition = (status: string) => {
        updateReservation(
            { reservationId: reservation.id, data: { status: status as any } },
            {
                onSuccess: () => onActionComplete?.(),
                onError: (error: any) => {
                    const msg = error.response?.data?.message || "";
                    if (msg.toLowerCase().includes("cannot transition")) {
                        toast.error("This action is no longer available. Please refresh.");
                        onActionComplete?.();
                    }
                },
            }
        );
    };

    const handleCancel = () => {
        cancelReservation(
            { reservationId: reservation.id, cancelReason: cancelReason || undefined },
            { onSuccess: () => { setCancelDialogOpen(false); setCancelReason(""); onActionComplete?.(); } }
        );
    };

    const handleNoShow = () => {
        markNoShow(reservation.id, {
            onSuccess: () => { setNoShowDialogOpen(false); onActionComplete?.(); }
        });
    };

    if (!reservation || actions.length === 0) return null;

    const btnClass = variant === "stacked" ? "w-full justify-start" : "";

    return (
        <>
            <div className={cn("flex gap-1.5 flex-wrap", variant === "stacked" && "flex-col")}>
                {actions.includes("confirm") && (
                    <Button size={size} variant="outline" className={cn("border-green-500/30 text-green-700 hover:bg-green-500/10 dark:text-green-400", btnClass)}
                        disabled={isUpdatingReservation} onClick={() => handleTransition("confirmed")}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm
                    </Button>
                )}
                {actions.includes("seat") && (
                    <Button size={size} variant="outline" className={cn("border-blue-500/30 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400", btnClass)}
                        disabled={isUpdatingReservation} onClick={() => handleTransition("seated")}>
                        <Armchair className="w-3.5 h-3.5 mr-1" /> Seat
                    </Button>
                )}
                {actions.includes("complete") && (
                    <Button size={size} variant="outline" className={cn("border-border text-muted-foreground hover:bg-muted", btnClass)}
                        disabled={isUpdatingReservation} onClick={() => handleTransition("completed")}>
                        <Flag className="w-3.5 h-3.5 mr-1" /> Complete
                    </Button>
                )}
                {actions.includes("no_show") && (
                    <Button size={size} variant="outline" className={cn("border-orange-500/30 text-orange-700 hover:bg-orange-500/10 dark:text-orange-400", btnClass)}
                        onClick={() => setNoShowDialogOpen(true)}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> No-Show
                    </Button>
                )}
                {actions.includes("cancel") && (
                    <Button size={size} variant="outline" className={cn("border-destructive/30 text-destructive hover:bg-destructive/10", btnClass)}
                        onClick={() => setCancelDialogOpen(true)}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                )}
            </div>

            {/* Cancel dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Cancel Reservation</DialogTitle>
                        <DialogDescription>Optionally provide a reason for the cancellation.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label className="text-xs">Cancel reason (optional)</Label>
                        <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="e.g. Customer requested cancellation" rows={3} />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCancelDialogOpen(false)}>Back</Button>
                        <Button variant="destructive" disabled={isCancellingReservation} onClick={handleCancel}>
                            {isCancellingReservation ? "Cancelling…" : "Confirm Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* No-show dialog */}
            <Dialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Mark as No-Show</DialogTitle>
                        <DialogDescription>Mark this reservation as a no-show? This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setNoShowDialogOpen(false)}>Back</Button>
                        <Button variant="destructive" disabled={isMarkingNoShow} onClick={handleNoShow}>
                            {isMarkingNoShow ? "Marking…" : "Mark No-Show"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
