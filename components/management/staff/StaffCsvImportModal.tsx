import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, UserPlus, Upload, X, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    ParseStaffCsvResult,
    ImportStaffCsvDto,
    StaffCsvColumnMappingDto,
    ImportStaffCsvResult,
} from "@/features/business/service";
import { useBusinessRoles } from "@/features/business/roles/useBusinessRoles";

const ACCEPTED_MIME_TYPES = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
const NONE_VALUE = "__none__";
const PREVIEW_ROW_COUNT = 5;

type OptionalField = "name" | "role";

interface StaffCsvImportModalProps {
    businessId: string;
    open: boolean;
    onClose: () => void;
    isParsing: boolean;
    isImporting: boolean;
    onParse: (file: File) => Promise<ParseStaffCsvResult>;
    onImport: (data: ImportStaffCsvDto) => Promise<ImportStaffCsvResult>;
}

export const StaffCsvImportModal: React.FC<StaffCsvImportModalProps> = ({
    businessId,
    open,
    onClose,
    isParsing,
    isImporting,
    onParse,
    onImport,
}) => {
    const { t } = useTranslation("management");
    const { businessRoles } = useBusinessRoles(businessId);

    const [step, setStep] = useState<"upload" | "map" | "result">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parseResult, setParseResult] = useState<ParseStaffCsvResult | null>(null);
    const [emailHeader, setEmailHeader] = useState<string>("");
    const [optionalHeaders, setOptionalHeaders] = useState<Record<OptionalField, string>>({
        name: NONE_VALUE,
        role: NONE_VALUE,
    });
    const [result, setResult] = useState<ImportStaffCsvResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inFlightRef = useRef(false);

    const reset = () => {
        setStep("upload");
        setFile(null);
        setDragActive(false);
        setParseError(null);
        setParseResult(null);
        setEmailHeader("");
        setOptionalHeaders({ name: NONE_VALUE, role: NONE_VALUE });
        setResult(null);
    };

    useEffect(() => {
        if (open) reset();
    }, [open]);

    const handleFile = (f: File) => {
        const looksLikeCsv = ACCEPTED_MIME_TYPES.includes(f.type) || /\.csv$/i.test(f.name);
        if (!looksLikeCsv) {
            toast.error(t("staff_csv_import_modal.select_csv_error"));
            return;
        }
        setParseError(null);
        setFile(f);
    };

    const handleParse = async () => {
        if (!file || inFlightRef.current) return;
        inFlightRef.current = true;
        setParseError(null);
        try {
            const parsed = await onParse(file);
            if (!parsed.headers.length || !parsed.rows.length) {
                setParseError(t("staff_csv_import_modal.no_rows_error"));
                return;
            }
            setParseResult(parsed);
            setEmailHeader(parsed.suggestedMapping.email ?? "");
            setOptionalHeaders({
                name: parsed.suggestedMapping.name ?? NONE_VALUE,
                role: parsed.suggestedMapping.role ?? NONE_VALUE,
            });
            setStep("map");
        } catch (err: any) {
            setParseError(t("staff_csv_import_modal.parse_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    const updateOptional = (field: OptionalField, value: string) => {
        setOptionalHeaders((prev) => ({ ...prev, [field]: value }));
    };

    const handleImport = async () => {
        if (inFlightRef.current || !parseResult) return;
        if (!emailHeader) {
            toast.error(t("staff_csv_import_modal.select_email_column_error"));
            return;
        }
        inFlightRef.current = true;

        const mapping: StaffCsvColumnMappingDto = { email: emailHeader };
        (Object.keys(optionalHeaders) as OptionalField[]).forEach((field) => {
            const value = optionalHeaders[field];
            if (value !== NONE_VALUE) mapping[field] = value;
        });

        try {
            const res = await onImport({ headers: parseResult.headers, rows: parseResult.rows, mapping });
            setResult(res);
            setStep("result");
        } catch (err: any) {
            toast.error(t("staff_csv_import_modal.import_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-indigo-500" />
                        {step === "upload" && t("staff_csv_import_modal.title_upload")}
                        {step === "map" && t("staff_csv_import_modal.title_map")}
                        {step === "result" && t("staff_csv_import_modal.title_result")}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "upload" && t("staff_csv_import_modal.description_upload")}
                        {step === "map" && t("staff_csv_import_modal.description_map")}
                        {step === "result" && t("staff_csv_import_modal.description_result")}
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="space-y-4 mt-2">
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                const f = e.dataTransfer.files?.[0];
                                if (f) handleFile(f);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 min-h-[180px]",
                                dragActive
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400",
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                }}
                            />
                            <Upload className="h-8 w-8 text-zinc-400" />
                            <p className="text-sm font-medium">{t("staff_csv_import_modal.drag_drop_hint")}</p>
                            <p className="text-xs text-zinc-500">{file ? file.name : t("staff_csv_import_modal.csv_files_only")}</p>
                        </div>

                        {file && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-zinc-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                            >
                                <X className="h-4 w-4 mr-1" />
                                {t("staff_csv_import_modal.remove_file")}
                            </Button>
                        )}

                        {parseError && <p className="text-sm text-red-600">{parseError}</p>}
                    </div>
                )}

                {step === "map" && parseResult && (
                    <div className="space-y-5 mt-2">
                        {!parseResult.aiSuggested && (
                            <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-800 dark:text-amber-300">
                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>
                                    {t("staff_csv_import_modal.ai_mapping_unavailable")}
                                </span>
                            </div>
                        )}

                        <p className="text-sm text-zinc-500">{t("staff_csv_import_modal.rows_detected", { count: parseResult.rowCount })}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>
                                    {t("staff_csv_import_modal.email")} <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Select value={emailHeader} onValueChange={setEmailHeader}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("staff_csv_import_modal.select_a_column")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parseResult.headers.map((h) => (
                                            <SelectItem key={h} value={h}>
                                                {h}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>{t("staff_csv_import_modal.name")}</Label>
                                <Select value={optionalHeaders.name} onValueChange={(v) => updateOptional("name", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE_VALUE}>{t("staff_csv_import_modal.none")}</SelectItem>
                                        {parseResult.headers.map((h) => (
                                            <SelectItem key={h} value={h}>
                                                {h}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label>{t("staff_csv_import_modal.role")}</Label>
                                <Select value={optionalHeaders.role} onValueChange={(v) => updateOptional("role", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE_VALUE}>{t("staff_csv_import_modal.none_default_role")}</SelectItem>
                                        {parseResult.headers.map((h) => (
                                            <SelectItem key={h} value={h}>
                                                {h}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!!businessRoles?.length && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="text-xs text-zinc-500 mr-1">{t("staff_csv_import_modal.matches_existing_roles")}</span>
                                        {businessRoles.map((r) => (
                                            <Badge key={r.id} variant="secondary" className="text-xs font-normal">
                                                {r.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-500">{t("staff_csv_import_modal.preview_first_rows")}</Label>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {parseResult.headers.map((h) => (
                                                <TableHead key={h} className="whitespace-nowrap">
                                                    {h}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parseResult.rows.slice(0, PREVIEW_ROW_COUNT).map((row, i) => (
                                            <TableRow key={i}>
                                                {row.map((cell, j) => (
                                                    <TableCell key={j} className="whitespace-nowrap">
                                                        {cell}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                {step === "result" && result && (
                    <div className="space-y-4 mt-2">
                        <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-sm text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{t("staff_csv_import_modal.invitations_sent", { count: result.invited })}</span>
                        </div>

                        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                            {result.skippedAlreadyStaff > 0 && (
                                <li>{t("staff_csv_import_modal.skipped_already_staff", { count: result.skippedAlreadyStaff })}</li>
                            )}
                            {result.skippedDuplicateInFile > 0 && (
                                <li>{t("staff_csv_import_modal.skipped_duplicate", { count: result.skippedDuplicateInFile })}</li>
                            )}
                            {result.skippedInvalidEmail > 0 && (
                                <li>{t("staff_csv_import_modal.skipped_invalid_email", { count: result.skippedInvalidEmail })}</li>
                            )}
                            {result.skippedLimitReached > 0 && (
                                <li>{t("staff_csv_import_modal.skipped_limit_reached", { count: result.skippedLimitReached })}</li>
                            )}
                            {result.skippedOther > 0 && (
                                <li>{t("staff_csv_import_modal.skipped_other", { count: result.skippedOther })}</li>
                            )}
                        </ul>

                        {result.unmatchedRoles.length > 0 && (
                            <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-800 dark:text-amber-300">
                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>
                                    {t("staff_csv_import_modal.unmatched_roles_prefix")}{" "}
                                    {result.unmatchedRoles.join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    {step === "map" && (
                        <Button variant="outline" onClick={() => setStep("upload")} disabled={isImporting}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {t("staff_csv_import_modal.back")}
                        </Button>
                    )}
                    {step !== "result" && (
                        <Button variant="outline" onClick={onClose} disabled={isParsing || isImporting}>
                            {t("staff_csv_import_modal.cancel")}
                        </Button>
                    )}
                    {step === "upload" && (
                        <Button onClick={handleParse} disabled={!file || isParsing}>
                            {isParsing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isParsing ? t("staff_csv_import_modal.analyzing_columns") : t("staff_csv_import_modal.analyze_file")}
                        </Button>
                    )}
                    {step === "map" && (
                        <Button onClick={handleImport} disabled={isImporting || !emailHeader}>
                            {isImporting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isImporting ? t("staff_csv_import_modal.sending_invitations") : t("staff_csv_import_modal.send_invitations")}
                        </Button>
                    )}
                    {step === "result" && <Button onClick={onClose}>{t("staff_csv_import_modal.done")}</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
