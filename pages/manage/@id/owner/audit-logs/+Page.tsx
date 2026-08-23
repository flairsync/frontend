import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ScrollText, X, Eye } from "lucide-react";
import { useAuditLogs } from "@/features/audit/useAuditLogs";
import { AuditAction, AuditLog } from "@/features/audit/service";
import { AuditLogDetailsModal } from "@/components/audit/AuditLogDetailsModal";

const ACTION_STYLES: Record<AuditAction, string> = {
    [AuditAction.CREATE]: "bg-green-100 text-green-700 hover:bg-green-100",
    [AuditAction.UPDATE]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    [AuditAction.DELETE]: "bg-red-100 text-red-700 hover:bg-red-100",
};

function getEntityTypes(t: (key: string) => string) {
    return [
        { value: "business", label: t("audit_logs_page.entity_types.business") },
        { value: "menu", label: t("audit_logs_page.entity_types.menu") },
        { value: "menu_item", label: t("audit_logs_page.entity_types.menu_item") },
        { value: "menu_category", label: t("audit_logs_page.entity_types.menu_category") },
        { value: "shift", label: t("audit_logs_page.entity_types.shift") },
        { value: "role", label: t("audit_logs_page.entity_types.role") },
        { value: "reservation", label: t("audit_logs_page.entity_types.reservation") },
        { value: "order", label: t("audit_logs_page.entity_types.order") },
        { value: "inventory_item", label: t("audit_logs_page.entity_types.inventory_item") },
    ];
}

const AuditLogsPage: React.FC = () => {
    const { t } = useTranslation("management");
    const ENTITY_TYPES = getEntityTypes(t);
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [page, setPage] = useState(1);
    const [entityType, setEntityType] = useState("");
    const [action, setAction] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data, isLoading } = useAuditLogs({
        businessId,
        entityType: entityType || undefined,
        action: (action as AuditAction) || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 20,
    });

    const logs = data?.data ?? [];
    const totalPages = data?.pages ?? 1;

    const hasFilters = !!(entityType || action || from || to);

    const clearFilters = () => {
        setEntityType("");
        setAction("");
        setFrom("");
        setTo("");
        setPage(1);
    };

    const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
        setter(v === "_all" ? "" : v);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("audit_logs_page.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("audit_logs_page.subtitle")}
                </p>
            </div>

            <Separator />

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 flex flex-wrap gap-3 items-center">
                    <Select value={entityType || "_all"} onValueChange={handleFilterChange(setEntityType)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder={t("audit_logs_page.all_entity_types")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">{t("audit_logs_page.all_entity_types")}</SelectItem>
                            {ENTITY_TYPES.map((et) => (
                                <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={action || "_all"} onValueChange={handleFilterChange(setAction)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder={t("audit_logs_page.all_actions")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">{t("audit_logs_page.all_actions")}</SelectItem>
                            <SelectItem value="CREATE">{t("audit_logs_page.action_create")}</SelectItem>
                            <SelectItem value="UPDATE">{t("audit_logs_page.action_update")}</SelectItem>
                            <SelectItem value="DELETE">{t("audit_logs_page.action_delete")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={from}
                            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                            className="w-40"
                        />
                        <span className="text-zinc-400 text-sm">{t("audit_logs_page.to")}</span>
                        <Input
                            type="date"
                            value={to}
                            onChange={(e) => { setTo(e.target.value); setPage(1); }}
                            className="w-40"
                        />
                    </div>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-zinc-500">
                            <X className="h-3.5 w-3.5" /> {t("audit_logs_page.clear")}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">{t("audit_logs_page.col_time")}</TableHead>
                                <TableHead>{t("audit_logs_page.col_action")}</TableHead>
                                <TableHead>{t("audit_logs_page.col_entity")}</TableHead>
                                <TableHead>{t("audit_logs_page.col_changed_by")}</TableHead>
                                <TableHead>{t("audit_logs_page.col_changes")}</TableHead>
                                <TableHead className="sticky right-0 bg-background text-right pr-4">{t("audit_logs_page.col_details")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                                        {hasFilters ? t("audit_logs_page.empty_filtered") : t("audit_logs_page.empty")}
                                    </TableCell>
                                </TableRow>
                            ) : logs.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <TableCell className="pl-4 text-sm text-muted-foreground whitespace-nowrap">
                                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={ACTION_STYLES[log.action]}>
                                            {t(`audit_logs_page.action_${log.action.toLowerCase()}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium capitalize text-sm">
                                                {ENTITY_TYPES.find((et) => et.value === log.entityType)?.label ?? log.entityType.replace(/_/g, " ")}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {log.entityId.slice(0, 8)}…
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {log.actor
                                            ? `${log.actor.firstName} ${log.actor.lastName}`
                                            : <span className="font-mono text-xs text-muted-foreground">{log.changedBy.slice(0, 8)}…</span>
                                        }
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        {log.changes ? (
                                            <div className="text-xs space-y-0.5">
                                                {Object.entries(log.changes).slice(0, 3).map(([field, { old: oldVal, new: newVal }]) => (
                                                    <div key={field} className="flex items-center gap-1 flex-wrap">
                                                        <span className="text-muted-foreground font-medium">{field}:</span>
                                                        <span className="line-through text-red-500 max-w-[64px] truncate">{String(oldVal ?? "—")}</span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <span className="text-green-600 max-w-[64px] truncate">{String(newVal ?? "—")}</span>
                                                    </div>
                                                ))}
                                                {Object.keys(log.changes).length > 3 && (
                                                    <span className="text-muted-foreground">
                                                        {t("audit_logs_page.more_fields", { count: Object.keys(log.changes).length - 3 })}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                        {log.reason && (
                                            <p className="text-xs text-muted-foreground italic mt-1">"{log.reason}"</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-background text-right pr-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title={t("audit_logs_page.view_details")}
                                            aria-label={t("audit_logs_page.view_details")}
                                            onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <span className="text-sm text-muted-foreground">
                                {t("audit_logs_page.page_of", { page, totalPages })}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AuditLogDetailsModal
                log={selectedLog}
                open={!!selectedLog}
                onOpenChange={(v) => { if (!v) setSelectedLog(null); }}
            />
        </div>
    );
};

export default AuditLogsPage;
