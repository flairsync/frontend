import { useState } from "react";
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
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useFiscalInvoices } from "@/features/fiscal-invoices/useFiscalInvoices";
import { FiscalInvoiceType, getFiscalInvoicesExportUrl } from "@/features/fiscal-invoices/service";

const TYPE_STYLES: Record<FiscalInvoiceType, string> = {
    [FiscalInvoiceType.STANDARD]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    [FiscalInvoiceType.CORRECTION]: "bg-amber-100 text-amber-700 hover:bg-amber-100",
};

function truncate(value: string | null, length = 8) {
    if (!value) return "—";
    return value.length > length ? `${value.slice(0, length)}…` : value;
}

const FiscalInvoicesPage: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [page, setPage] = useState(1);
    const [type, setType] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const { data, isLoading } = useFiscalInvoices({
        businessId,
        type: (type as FiscalInvoiceType) || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 20,
    });

    const invoices = data?.data ?? [];
    const totalPages = data?.pages ?? 1;

    const hasFilters = !!(type || from || to);

    const clearFilters = () => {
        setType("");
        setFrom("");
        setTo("");
        setPage(1);
    };

    const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
        setter(v === "_all" ? "" : v);
        setPage(1);
    };

    const handleExport = () => {
        const url = getFiscalInvoicesExportUrl(businessId, from || undefined, to || undefined, (type as FiscalInvoiceType) || undefined);
        const a = document.createElement("a");
        a.href = url;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fiscal Invoices</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        The legal invoice register for Spain-compliant businesses — sequential numbers, hash chain, and corrections.
                    </p>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Separator />

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 flex flex-wrap gap-3 items-center">
                    <Select value={type || "_all"} onValueChange={handleFilterChange(setType)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">All types</SelectItem>
                            <SelectItem value={FiscalInvoiceType.STANDARD}>Standard</SelectItem>
                            <SelectItem value={FiscalInvoiceType.CORRECTION}>Correction</SelectItem>
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
                                <TableHead className="pl-4">Invoice Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Issued At</TableHead>
                                <TableHead className="pr-4">Hash</TableHead>
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
                            ) : invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                                        No fiscal invoices found{hasFilters ? " for the selected filters" : ""}.
                                    </TableCell>
                                </TableRow>
                            ) : invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="pl-4 font-mono text-sm font-medium">
                                        {inv.invoiceNumber}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={TYPE_STYLES[inv.type]}>
                                            {inv.type}
                                        </Badge>
                                        {inv.type === FiscalInvoiceType.CORRECTION && (
                                            <div className="text-xs text-muted-foreground font-mono mt-1">
                                                corrects {truncate(inv.correctsInvoiceId)}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">{inv.status}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                        {truncate(inv.orderId)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {inv.issuedAt ? format(new Date(inv.issuedAt), "MMM d, yyyy HH:mm") : "—"}
                                    </TableCell>
                                    <TableCell className="pr-4 text-xs text-muted-foreground font-mono" title={inv.hash}>
                                        {truncate(inv.hash, 12)}
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

export default FiscalInvoicesPage;
