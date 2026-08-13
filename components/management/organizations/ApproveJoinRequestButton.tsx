import React from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";
import { useProfile } from "@/features/profile/useProfile";
import { JoinRequest } from "@/features/join-requests/join-requests";

interface ApproveJoinRequestButtonProps {
    request: JoinRequest;
    onApprove: () => void;
    disabled?: boolean;
}

// Approving a LINK request is the moment a business actually becomes linked
// to a region/org (JoinRequestsService never links silently, even when the
// same person owns both sides — see applyLink()). When the approver is the
// business's own owner, that's also the moment they hand the region/org the
// ability to reassign this business's ownership later without needing their
// confirmation again — worth a heads-up here since nothing else in the flow
// surfaces it.
export const ApproveJoinRequestButton: React.FC<ApproveJoinRequestButtonProps> = ({
    request,
    onApprove,
    disabled,
}) => {
    const { userProfile } = useProfile();

    const isOwnershipHandover =
        request.action === "LINK" && request.childType === "BUSINESS" && request.childOwnerId === userProfile?.id;

    if (!isOwnershipHandover) {
        return (
            <Button size="sm" className="h-8" disabled={disabled} onClick={onApprove}>
                <Check className="h-3.5 w-3.5 mr-1" /> Approve
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="h-8" disabled={disabled}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Join {request.parentName}?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                You'll keep managing {request.childName} day-to-day — nothing about your access
                                changes today.
                            </p>
                            <p className="text-foreground font-medium">
                                But from now on, {request.parentName} can reassign this business's ownership to
                                someone else at any time, without needing your confirmation. If that happens,
                                you'd move to a regular staff role — your employment history is always kept,
                                never deleted.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={disabled} onClick={onApprove}>
                        {disabled ? "Joining…" : "Yes, join"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
