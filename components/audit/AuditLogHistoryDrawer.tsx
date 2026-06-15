import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useAuditLogs } from "@/features/audit/useAuditLogs";
import { usePublicProfile } from "@/features/profile/usePublicProfile";
import { AuditAction, AuditLog } from "@/features/audit/service";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditLogHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  businessId: string;
  entityLabel?: string;
}

const ACTION_STYLES: Record<AuditAction, { label: string; color: string }> = {
  [AuditAction.CREATE]: { label: "Created", color: "bg-green-100 text-green-800 border-green-200" },
  [AuditAction.UPDATE]: { label: "Updated", color: "bg-blue-100 text-blue-800 border-blue-200" },
  [AuditAction.DELETE]: { label: "Deleted", color: "bg-red-100 text-red-800 border-red-200" },
};

const UserName: React.FC<{ userId: string }> = ({ userId }) => {
  const { publicUserDispalyName } = usePublicProfile(userId);
  return (
    <span className="text-foreground font-medium">
      {publicUserDispalyName ?? `${userId.slice(0, 8)}…`}
    </span>
  );
};

const formatFieldName = (field: string): string =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

const renderValue = (val: unknown): string => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val === "" ? '""' : val;
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (obj.type === "Point" && Array.isArray(obj.coordinates)) {
      const [lng, lat] = obj.coordinates as number[];
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    return JSON.stringify(val);
  }
  return String(val);
};

const ChangeDetails: React.FC<{ changes: AuditLog["changes"] }> = ({ changes }) => {
  if (!changes) return null;
  const entries = Object.entries(changes);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5 border-t pt-2">
      {entries.map(([field, { old: oldVal, new: newVal }]) => (
        <div key={field} className="text-xs">
          <span className="text-muted-foreground font-medium font-mono text-[10px] uppercase tracking-wide">
            {formatFieldName(field)}
          </span>
          <div className="flex items-start gap-1.5 mt-0.5 flex-wrap">
            <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono text-[11px] max-w-[45%] break-all">
              {renderValue(oldVal)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-mono text-[11px] max-w-[45%] break-all">
              {renderValue(newVal)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AuditLogHistoryDrawer: React.FC<AuditLogHistoryDrawerProps> = ({
  open,
  onOpenChange,
  entityType,
  entityId,
  businessId,
  entityLabel,
}) => {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useAuditLogs({
    businessId,
    entityType,
    entityId,
    page,
    limit: 20,
  });

  const logs = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Modification History{entityLabel ? ` — ${entityLabel}` : ""}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {isFetching ? (
            <div className="py-10 text-center text-muted-foreground animate-pulse">
              Loading history…
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No history recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const style = ACTION_STYLES[log.action] ?? {
                label: log.action,
                color: "bg-gray-100 text-gray-800 border-gray-200",
              };
              const hasChanges =
                log.changes && Object.keys(log.changes).length > 0;

              return (
                <div
                  key={log.id}
                  className="flex flex-col gap-1.5 p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[11px] font-medium border", style.color)}
                    >
                      {style.label}
                    </Badge>
                    <span
                      className="text-xs text-muted-foreground shrink-0"
                      title={format(new Date(log.createdAt), "PPpp")}
                    >
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    by <UserName userId={log.changedBy} />
                  </p>

                  {hasChanges && <ChangeDetails changes={log.changes} />}

                  {log.reason && (
                    <p className="text-xs text-muted-foreground italic border-t pt-1.5 mt-0.5">
                      "{log.reason}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
