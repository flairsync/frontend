import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Clock, FileText, Tag } from "lucide-react";
import { AuditAction, AuditLog } from "@/features/audit/service";
import { formatFieldName, renderAuditValue } from "@/features/audit/formatters";
import { format, formatDistanceToNow } from "date-fns";

const ACTION_STYLES: Record<AuditAction, { label: string; color: string }> = {
    [AuditAction.CREATE]: { label: "Created", color: "bg-green-100 text-green-800 border-green-200" },
    [AuditAction.UPDATE]: { label: "Updated", color: "bg-blue-100 text-blue-800 border-blue-200" },
    [AuditAction.DELETE]: { label: "Deleted", color: "bg-red-100 text-red-800 border-red-200" },
};

interface AuditLogDetailsModalProps {
    log: AuditLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({ log, open, onOpenChange }) => {
    if (!log) return null;

    const style = ACTION_STYLES[log.action] ?? { label: log.action, color: "bg-gray-100 text-gray-800 border-gray-200" };
    const changeEntries = log.changes ? Object.entries(log.changes) : [];
    const actorName = log.actor ? `${log.actor.firstName} ${log.actor.lastName}`.trim() : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Badge variant="outline" className={style.color}>
                            {style.label}
                        </Badge>
                        <span className="capitalize font-normal text-muted-foreground text-sm">
                            {log.entityType.replace(/_/g, " ")}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Full details for this audit log entry.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Who / When / Entity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Who</p>
                                <p className="font-medium">
                                    {actorName || (
                                        <span className="font-mono text-xs">{log.changedBy.slice(0, 8)}…</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">When</p>
                                <p className="font-medium">{format(new Date(log.createdAt), "PPpp")}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">Entity ID</p>
                                <p className="font-mono text-xs break-all">{log.entityId}</p>
                            </div>
                        </div>
                        {log.reason && (
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Reason</p>
                                    <p className="italic">"{log.reason}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Full before/after diff */}
                    <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            {log.action === AuditAction.CREATE ? "Created with" : "What changed"}
                        </p>
                        {changeEntries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No field-level changes recorded.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {changeEntries.map(([field, { old: oldVal, new: newVal }]) => (
                                    <div key={field} className="text-xs">
                                        <span className="text-muted-foreground font-medium font-mono text-[10px] uppercase tracking-wide">
                                            {formatFieldName(field)}
                                        </span>
                                        <div className="flex items-start gap-1.5 mt-0.5 flex-wrap">
                                            <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono text-[11px] break-all">
                                                {renderAuditValue(oldVal)}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-mono text-[11px] break-all">
                                                {renderAuditValue(newVal)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
