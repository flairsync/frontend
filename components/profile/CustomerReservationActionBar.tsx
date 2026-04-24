import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservationAction } from "@/features/discovery/useDiscovery";
import { CustomerActionType, CustomerActionPayload } from "@/features/discovery/types";
import { Loader2, CheckCircle, Clock, X, Edit2, HandMetal } from "lucide-react";

interface CustomerReservationActionBarProps {
    businessId: string;
    reservationId: string;
    availableActions: CustomerActionType[];
}

const DELAY_OPTIONS = [5, 10, 15, 20, 30];

type ExpandedAction = CustomerActionType | null;

export const CustomerReservationActionBar: React.FC<CustomerReservationActionBarProps> = ({
    businessId,
    reservationId,
    availableActions,
}) => {
    const [expanded, setExpanded] = useState<ExpandedAction>(null);

    // Running late state
    const [delayMinutes, setDelayMinutes] = useState<string>("");

    // Request cancellation state
    const [cancelNotes, setCancelNotes] = useState("");

    // Request modification state
    const [modTime, setModTime] = useState("");
    const [modGuests, setModGuests] = useState("");

    const { mutate: postAction, isPending } = useReservationAction(businessId, reservationId);

    if (availableActions.length === 0) return null;

    const send = (payload: CustomerActionPayload) => {
        postAction(payload, {
            onSuccess: () => {
                setExpanded(null);
                setDelayMinutes("");
                setCancelNotes("");
                setModTime("");
                setModGuests("");
            },
        });
    };

    const handleSimple = (type: CustomerActionType) => send({ type });

    return (
        <div className="border-t bg-background pt-4 pb-2 space-y-3">
            <p className="text-xs text-muted-foreground font-medium px-1">What would you like to do?</p>

            <div className="flex flex-col gap-2">

                {/* confirm_attendance — simple tap */}
                {availableActions.includes('confirm_attendance') && (
                    <Button
                        className="w-full justify-start"
                        disabled={isPending}
                        onClick={() => handleSimple('confirm_attendance')}
                    >
                        {isPending && expanded === null ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        I'll be there ✓
                    </Button>
                )}

                {/* acknowledge_delay — simple tap */}
                {availableActions.includes('acknowledge_delay') && (
                    <Button
                        variant="secondary"
                        className="w-full justify-start"
                        disabled={isPending}
                        onClick={() => handleSimple('acknowledge_delay')}
                    >
                        <HandMetal className="w-4 h-4 mr-2" />
                        I'll wait
                    </Button>
                )}

                {/* running_late — with delay picker */}
                {availableActions.includes('running_late') && (
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={() => setExpanded(expanded === 'running_late' ? null : 'running_late')}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            I'm running late
                        </Button>
                        {expanded === 'running_late' && (
                            <div className="bg-muted/40 border rounded-xl p-3 space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">About how many minutes?</Label>
                                    <Select value={delayMinutes} onValueChange={setDelayMinutes}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DELAY_OPTIONS.map((m) => (
                                                <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    disabled={isPending}
                                    onClick={() => send({ type: 'running_late', estimatedDelayMinutes: delayMinutes ? Number(delayMinutes) : undefined })}
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                    Send
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* request_modification — date + guest pickers */}
                {availableActions.includes('request_modification') && (
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setExpanded(expanded === 'request_modification' ? null : 'request_modification')}
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Request a change
                        </Button>
                        {expanded === 'request_modification' && (
                            <div className="bg-muted/40 border rounded-xl p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">New date & time (optional)</Label>
                                        <Input
                                            type="datetime-local"
                                            value={modTime}
                                            onChange={(e) => setModTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">New party size (optional)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={50}
                                            placeholder="e.g. 4"
                                            value={modGuests}
                                            onChange={(e) => setModGuests(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    disabled={isPending || (!modTime && !modGuests)}
                                    onClick={() => send({
                                        type: 'request_modification',
                                        requestedTime: modTime ? new Date(modTime).toISOString() : undefined,
                                        requestedGuestCount: modGuests ? Number(modGuests) : undefined,
                                    })}
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                    Send Request
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* request_cancellation — with optional reason */}
                {availableActions.includes('request_cancellation') && (
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => setExpanded(expanded === 'request_cancellation' ? null : 'request_cancellation')}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Request cancellation
                        </Button>
                        {expanded === 'request_cancellation' && (
                            <div className="bg-muted/40 border rounded-xl p-3 space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    This sends a cancellation request to the restaurant. They will confirm shortly. Your reservation remains active until then.
                                </p>
                                <div className="space-y-1">
                                    <Label className="text-xs">Reason (optional)</Label>
                                    <Textarea
                                        value={cancelNotes}
                                        onChange={(e) => setCancelNotes(e.target.value)}
                                        placeholder="e.g. Change of plans"
                                        rows={2}
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="w-full"
                                    disabled={isPending}
                                    onClick={() => send({ type: 'request_cancellation', notes: cancelNotes || undefined })}
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                    Send Request
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
