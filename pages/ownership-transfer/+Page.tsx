import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ShieldAlert } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import { useOwnershipTransferByToken } from "@/features/ownershipTransfer/useOwnershipTransfer";
import { AxiosError } from "axios";

const OwnershipTransferPage: React.FC = () => {
  const { urlParsed } = usePageContext();
  const token = urlParsed.search["token"] || null;

  const {
    transfer,
    fetchingTransfer,
    transferLoadError,
    transferError,
    confirmOwnershipTransfer,
    confirmingOwnershipTransfer,
    cancelOwnershipTransfer,
    cancellingOwnershipTransfer,
  } = useOwnershipTransferByToken(token);

  const actionInProgress = confirmingOwnershipTransfer || cancellingOwnershipTransfer;

  const notFound =
    !token ||
    (transferLoadError &&
      transferError instanceof AxiosError &&
      transferError.response?.status === 404);

  let content: React.ReactNode;

  if (!token || notFound) {
    content = (
      <StatusBlock
        icon={<XCircle className="h-10 w-10 text-red-500" />}
        title="This link isn't valid"
        description="It may have expired, been cancelled, or you may not be a participant in this transfer."
      />
    );
  } else if (fetchingTransfer) {
    content = (
      <StatusBlock
        icon={<Clock className="h-10 w-10 text-muted-foreground animate-pulse" />}
        title="Loading..."
        description="Fetching transfer details."
      />
    );
  } else if (transferLoadError || !transfer) {
    content = (
      <StatusBlock
        icon={<XCircle className="h-10 w-10 text-red-500" />}
        title="Something went wrong"
        description="We couldn't load this transfer. Please try again later."
      />
    );
  } else if (transfer.status === "PENDING_CONFIRMATION" && transfer.isNewOwner) {
    content = (
      <>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Confirm ownership transfer of {transfer.businessName}
          </CardTitle>
          <CardDescription className="mt-1">
            Confirming starts a 3-day grace period — either side can still cancel before it
            completes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Button
              disabled={actionInProgress}
              onClick={() => confirmOwnershipTransfer()}
            >
              {confirmingOwnershipTransfer ? "Confirming..." : "Confirm transfer"}
            </Button>
            <Button
              variant="destructive"
              disabled={actionInProgress}
              onClick={() => cancelOwnershipTransfer()}
            >
              {cancellingOwnershipTransfer ? "Declining..." : "Decline"}
            </Button>
          </div>
        </CardContent>
      </>
    );
  } else if (transfer.status === "PENDING_CONFIRMATION") {
    content = (
      <StatusActionBlock
        icon={<Clock className="h-10 w-10 text-amber-500" />}
        title={`Ownership transfer of ${transfer.businessName} is pending`}
        description={`Waiting on the invited new owner to confirm (expires ${transfer.tokenExpiresAt.toLocaleDateString()}).`}
        actionLabel={cancellingOwnershipTransfer ? "Cancelling..." : "Cancel transfer"}
        onAction={() => cancelOwnershipTransfer()}
        actionDisabled={actionInProgress}
      />
    );
  } else if (transfer.status === "CONFIRMED") {
    content = (
      <StatusActionBlock
        icon={<Clock className="h-10 w-10 text-amber-500" />}
        title={`Ownership transfer of ${transfer.businessName} is confirmed`}
        description={`It will complete automatically on ${transfer.graceEndsAt?.toLocaleDateString()} unless cancelled before then.`}
        actionLabel={cancellingOwnershipTransfer ? "Cancelling..." : "Cancel transfer"}
        onAction={() => cancelOwnershipTransfer()}
        actionDisabled={actionInProgress}
      />
    );
  } else if (transfer.status === "COMPLETED") {
    content = (
      <StatusBlock
        icon={<CheckCircle className="h-10 w-10 text-green-500" />}
        title="Ownership transfer complete"
        description={
          transfer.isNewOwner
            ? `You are now the owner of ${transfer.businessName}.`
            : `Ownership of ${transfer.businessName} has been transferred.`
        }
      />
    );
  } else {
    content = (
      <StatusBlock
        icon={<XCircle className="h-10 w-10 text-muted-foreground" />}
        title={`Ownership transfer ${transfer.status === "CANCELLED" ? "cancelled" : "expired"}`}
        description={`Nothing changed — the current owner of ${transfer.businessName} remains in place.`}
      />
    );
  }

  return (
    <div>
      <PublicFeedHeader />
      <div className="max-w-xl mx-auto mt-10 px-4 pt-20">
        <Card>{content}</Card>
      </div>
      <WebsiteFooter />
    </div>
  );
};

function StatusBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      <CardDescription className="mt-1">{description}</CardDescription>
    </CardHeader>
  );
}

function StatusActionBlock({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled: boolean;
}) {
  return (
    <>
      <StatusBlock icon={icon} title={title} description={description} />
      <CardContent className="flex justify-center">
        <Button variant="destructive" disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </>
  );
}

export default OwnershipTransferPage;
