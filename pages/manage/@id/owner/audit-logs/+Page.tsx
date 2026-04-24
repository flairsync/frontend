import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent } from "@/components/ui/card";
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
import { ChevronLeft, ChevronRight, ScrollText, X } from "lucide-react";
import { useAuditLogs } from "@/features/audit/useAuditLogs";
import { AuditAction } from "@/features/audit/service";

const ACTION_STYLES: Record<AuditAction, string> = {
    [AuditAction.CREATE]: "bg-green-100 text-green-700 hover:bg-green-100",
    [AuditAction.UPDATE]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    [AuditAction.DELETE]: "bg-red-100 text-red-700 hover:bg-red-100",
};

const ENTITY_TYPES = [
    { value: "business", label: "Business" },
    { value: "menu", label: "Menu" },
    { value: "menu_item", label: "Menu Item" },
    { value: "menu_category", label: "Category" },
    { value: "shift", label: "Shift" },
    { value: "role", label: "Role" },
    { value: "reservation", label: "Reservation" },
    { value: "order", label: "Order" },
    { value: "inventory_item", label: "Inventory" },
];

const AuditLogsPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [page, setPage] = useState(1);
    const [entityType, setEntityType] = useState("");
    const [action, setAction] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

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
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <ScrollText className="h-6 w-6 text-indigo-500" />
                <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Audit Logs</h1>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 -mt-4">
                Full traceability of every change made across your business.
            </p>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 flex flex-wrap gap-3 items-center">
                    <Select value={entityType || "_all"} onValueChange={handleFilterChange(setEntityType)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All entity types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">All entity types</SelectItem>
                            {ENTITY_TYPES.map((et) => (
                                <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={action || "_all"} onValueChange={handleFilterChange(setAction)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">All actions</SelectItem>
                            <SelectItem value="CREATE">Create</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DELETE">Delete</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={from}
                            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                            className="w-40"
                        />
                        <span className="text-zinc-400 text-sm">to</span>
                        <Input
                            type="date"
                            value={to}
                            onChange={(e) => { setTo(e.target.value); setPage(1); }}
                            className="w-40"
                        />
                    </div>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-zinc-500">
                            <X className="h-3.5 w-3.5" /> Clear
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
                                <TableHead className="pl-4">Time</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Changed By</TableHead>
                                <TableHead>Changes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-16">
                                        No audit logs found{hasFilters ? " for the selected filters" : ""}.
                                    </TableCell>
                                </TableRow>
                            ) : logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="pl-4 text-sm text-muted-foreground whitespace-nowrap">
                                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={ACTION_STYLES[log.action]}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium capitalize text-sm">
                                                {log.entityType.replace(/_/g, " ")}
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
                                                        +{Object.keys(log.changes).length - 3} more field{Object.keys(log.changes).length - 3 > 1 ? "s" : ""}
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
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
        </div>
    );
};

export default AuditLogsPage;
