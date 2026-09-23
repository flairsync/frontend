import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Download,
    DatabaseBackup,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    ShieldAlert,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/shared/EmptyState";

import {
    useBusinessExports,
    useCreateBusinessExport,
    useDownloadBusinessExport,
} from "@/features/data-export/useDataExport";
import {
    BusinessExport,
    BusinessExportStatus,
    BusinessExportTrigger,
} from "@/features/data-export/service";

const STATUS_STYLES: Record<BusinessExportStatus, string> = {
    [BusinessExportStatus.READY]: "bg-green-100 text-green-700 hover:bg-green-100",
    [BusinessExportStatus.RUNNING]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    [BusinessExportStatus.PENDING]: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    [BusinessExportStatus.FAILED]: "bg-red-100 text-red-700 hover:bg-red-100",
    [BusinessExportStatus.EXPIRED]: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

function formatBytes(bytes: number | null): string {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function totalRecords(record: BusinessExport): number | null {
    if (!record.rowCounts) return null;
    return Object.values(record.rowCounts).reduce((a, b) => a + b, 0);
}

const DataExportPage: React.FC = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    // UUID, never the slug — BusinessOwnerGuard rejects non-UUIDs.
    const businessId = routeParams.id;

    const [includeGuestData, setIncludeGuestData] = useState(false);

    const { data: exports, isLoading, error } = useBusinessExports(businessId);
    const createExport = useCreateBusinessExport(businessId);
    const downloadExport = useDownloadBusinessExport(businessId);

    // 503 means the deployment has no dedicated private bucket, so the backend refuses to
    // write a business's data anywhere publicly readable. Surface it as "unavailable"
    // rather than a generic failure — it is a config gap, not the owner's problem.
    const unavailable = (error as any)?.response?.status === 503;

    const latestReady = exports?.find(
        (e) => e.status === BusinessExportStatus.READY,
    );
    const inFlight = exports?.some(
        (e) =>
            e.status === BusinessExportStatus.PENDING ||
            e.status === BusinessExportStatus.RUNNING,
    );
    const lastFailed =
        exports?.[0]?.status === BusinessExportStatus.FAILED ? exports[0] : null;

    const handleCreate = () => {
        createExport.mutate(includeGuestData, {
            onSuccess: () => toast.success(t("data_export_page.started")),
            onError: (err) => {
                const status = err.response?.status;
                if (status === 409) {
                    toast.error(t("data_export_page.errors.already_running"));
                } else if (status === 503) {
                    toast.error(t("data_export_page.errors.unavailable"));
                } else {
                    toast.error(t("data_export_page.errors.generic"));
                }
            },
        });
    };

    const handleDownload = (exportId: string) => {
        downloadExport.mutate(exportId, {
            onError: (err) => {
                if (err.response?.status === 410) {
                    toast.error(t("data_export_page.errors.expired"));
                } else {
                    toast.error(t("data_export_page.errors.download_failed"));
                }
            },
        });
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold">
                    <DatabaseBackup className="h-6 w-6" />
                    {t("data_export_page.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t("data_export_page.subtitle")}
                </p>
            </div>

            {unavailable ? (
                <Card>
                    <CardContent className="flex items-start gap-3 p-6">
                        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                            <p className="font-medium">
                                {t("data_export_page.unavailable_title")}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("data_export_page.unavailable_body")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/*
                      The status line is the most important element on this page. An owner
                      who sees a recent successful backup stops worrying; one who has to
                      trust an invisible process does not.
                    */}
                    <Card>
                        <CardContent className="p-6">
                            {isLoading ? (
                                <Skeleton className="h-6 w-64" />
                            ) : latestReady ? (
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                                    <div>
                                        <p className="font-medium">
                                            {t("data_export_page.last_backup", {
                                                when: format(
                                                    new Date(latestReady.createdAt),
                                                    "d MMM yyyy, HH:mm",
                                                ),
                                            })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatBytes(latestReady.sizeBytes)}
                                            {totalRecords(latestReady) !== null &&
                                                ` · ${totalRecords(latestReady)!.toLocaleString()} ${t("data_export_page.records")}`}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                                    <p className="text-sm">
                                        {t("data_export_page.no_backup_yet")}
                                    </p>
                                </div>
                            )}

                            {/*
                              A backup that stopped weeks ago is worse than none, because the
                              owner was calm the whole time and shouldn't have been. Failures
                              are shown, not just logged.
                            */}
                            {lastFailed && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                        <div>
                                            <p className="font-medium text-red-700">
                                                {t("data_export_page.last_failed")}
                                            </p>
                                            {lastFailed.error && (
                                                <p className="mt-1 break-all text-sm text-muted-foreground">
                                                    {lastFailed.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator className="my-4" />

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex items-start gap-2 text-sm">
                                    <Checkbox
                                        checked={includeGuestData}
                                        onCheckedChange={(v) => setIncludeGuestData(v === true)}
                                        className="mt-0.5"
                                    />
                                    <span>
                                        {t("data_export_page.include_guest_data")}
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {t("data_export_page.include_guest_data_hint")}
                                        </span>
                                    </span>
                                </label>

                                <Button
                                    onClick={handleCreate}
                                    disabled={createExport.isPending || inFlight}
                                    className="shrink-0"
                                >
                                    {createExport.isPending || inFlight ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("data_export_page.preparing")}
                                        </>
                                    ) : (
                                        <>
                                            <DatabaseBackup className="mr-2 h-4 w-4" />
                                            {t("data_export_page.export_now")}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {inFlight && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {t("data_export_page.preparing_hint")}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 md:p-6">
                                <h2 className="font-medium">
                                    {t("data_export_page.history")}
                                </h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("data_export_page.columns.date")}</TableHead>
                                        <TableHead>{t("data_export_page.columns.type")}</TableHead>
                                        <TableHead>{t("data_export_page.columns.status")}</TableHead>
                                        <TableHead>{t("data_export_page.columns.size")}</TableHead>
                                        <TableHead className="text-right">
                                            {t("data_export_page.columns.action")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Skeleton className="h-8 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ) : !exports?.length ? (
                                        <TableEmptyState
                                            colSpan={5}
                                            title={t("data_export_page.empty")}
                                        />
                                    ) : (
                                        exports.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(
                                                        new Date(record.createdAt),
                                                        "d MMM yyyy, HH:mm",
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.trigger === BusinessExportTrigger.SCHEDULED
                                                        ? t("data_export_page.trigger.scheduled")
                                                        : t("data_export_page.trigger.manual")}
                                                    {record.includeGuestData && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2 text-xs"
                                                        >
                                                            {t("data_export_page.with_guests")}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={STATUS_STYLES[record.status]}>
                                                        {t(
                                                            `data_export_page.status.${record.status.toLowerCase()}`,
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatBytes(record.sizeBytes)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {record.status === BusinessExportStatus.READY ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownload(record.id)}
                                                            disabled={downloadExport.isPending}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            {t("data_export_page.download")}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <p className="text-xs text-muted-foreground">
                        {t("data_export_page.footnote")}
                    </p>
                </>
            )}
        </div>
    );
};

export default DataExportPage;
