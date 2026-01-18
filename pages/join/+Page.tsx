import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";

const JoinBusinessPage: React.FC = () => {

  const { urlParsed } = usePageContext();

  const invitationToken = urlParsed.search["invitation"];

  /*  const {
     invitation,
     isLoading,
     acceptInvitation,
     refuseInvitation,
   } = useJoinInvitation(invitationToken!); */

  const [actionInProgress, setActionInProgress] = useState(false);

  const handleAccept = async () => {
  };

  const handleRefuse = async () => {
  };





  return (
    <div>
      <PublicFeedHeader />
      <div className="max-w-xl mx-auto mt-10 px-4 pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join {"Business name"}</CardTitle>
            <CardDescription className="mt-1 text-gray-500">
              You have been invited to join this business on FlairSync
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* Business avatar / logo */}
            <Avatar className="w-24 h-24">
              <AvatarImage src={""} alt={""} />
              <AvatarFallback>{"B"}</AvatarFallback>
            </Avatar>

            {/* Business details placeholder */}
            <div className="text-center space-y-1">
              <p className="font-medium text-lg">{"invitation.businessName"}</p>
              <p className="text-sm text-gray-500">Business ID: {invitationToken}</p>
              {/* Optional: add location, industry, or other metadata */}
              {/* <p className="text-sm text-gray-500">Industry: Placeholder</p> */}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={handleAccept}
                disabled={actionInProgress}
              >
                <Check className="w-4 h-4" />
                Accept Invitation
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleRefuse}
                disabled={actionInProgress}
              >
                <X className="w-4 h-4" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Optional footer / note */}
        <p className="text-center text-gray-400 text-sm mt-4">
          This invitation will expire in 24 hours. If you don’t want to join, simply ignore this page.
        </p>
      </div>

      <WebsiteFooter />
    </div>
  );
};

export default JoinBusinessPage;
