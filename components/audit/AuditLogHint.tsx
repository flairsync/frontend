import React from "react";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLatestAuditLog } from "@/features/audit/useAuditLogs";
import { AuditAction } from "@/features/audit/service";
import { cn } from "@/lib/utils";
import { usePublicProfile } from "@/features/profile/usePublicProfile";

interface AuditLogHintProps {
  entityType: string;
  entityId: string | undefined;
  businessId: string | undefined;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export const AuditLogHint: React.FC<AuditLogHintProps> = ({
  entityType,
  entityId,
  businessId,
  className,
  side = "top",
}) => {
  const { data: latestLog, isLoading } = useLatestAuditLog(
    businessId,
    entityType,
    entityId
  );

  const {
    publicUserDispalyName,
    loadingPublicUserDispalyName
  } = usePublicProfile(latestLog?.changedBy)

  if (isLoading || !latestLog) {
    return null;
  }

  const actionText = {
    [AuditAction.CREATE]: "Created",
    [AuditAction.UPDATE]: "Last modified",
    [AuditAction.DELETE]: "Deleted",
  }[latestLog.action] || "Last updated";

  const timeAgo = formatDistanceToNow(new Date(latestLog.createdAt), {
    addSuffix: true,
  });

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full inline-flex items-center cursor-pointer",
              className
            )}
          >
            <History className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="text-xs max-w-xs bg-popover text-popover-foreground border shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">
              {actionText} {timeAgo}
            </span>
            <span className="text-muted-foreground">
              by <span className="text-foreground">{publicUserDispalyName}</span>
            </span>
            {latestLog.reason && (
              <p className="mt-1 border-t pt-1 italic text-[10px]">
                "{latestLog.reason}"
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
