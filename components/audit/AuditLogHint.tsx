import React, { useState } from "react";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePageContext } from "vike-react/usePageContext";
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
import { AuditLogHistoryDrawer } from "./AuditLogHistoryDrawer";

interface AuditLogHintProps {
  entityType: string;
  entityId: string | undefined;
  businessId: string | undefined;
  className?: string;
  iconClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  entityLabel?: string;
}

export const AuditLogHint: React.FC<AuditLogHintProps> = ({
  entityType,
  entityId,
  businessId,
  className,
  iconClassName,
  side = "top",
  entityLabel,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Audit history is owner-only — there's no assignable "audit log" permission staff
  // can be granted (see public/locales/en/management.json's permissions list), so the
  // API 403s for staff. Gate on the /owner/ route segment rather than calling it at all,
  // since a failed request here trips flairapi's global permission-denied modal.
  const { urlPathname } = usePageContext();
  const canViewAuditLog = urlPathname.includes("/owner/");

  const { data: latestLog, isLoading } = useLatestAuditLog(
    businessId,
    entityType,
    entityId,
    canViewAuditLog
  );

  const { publicUserDispalyName } = usePublicProfile(latestLog?.changedBy);

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

  const canOpenDrawer = !!entityId && !!businessId;

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (canOpenDrawer) setDrawerOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  if (canOpenDrawer) setDrawerOpen(true);
                }
              }}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full inline-flex items-center cursor-pointer",
                className
              )}
            >
              <History className={cn("h-4 w-4", iconClassName)} />
            </span>
          </TooltipTrigger>
          <TooltipContent
            side={side}
            className="text-xs max-w-xs bg-popover text-popover-foreground border shadow-sm"
          >
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
              <p className="mt-1 border-t pt-1 text-[10px] text-muted-foreground/70">
                Click to view full history
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {canOpenDrawer && (
        <AuditLogHistoryDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          entityType={entityType}
          entityId={entityId}
          businessId={businessId}
          entityLabel={entityLabel}
        />
      )}
    </>
  );
};
