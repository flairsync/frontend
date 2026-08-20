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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileSpreadsheet, Upload, X, ArrowLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    ParseInventoryCsvResult,
    ImportCsvInventoryDto,
    CsvColumnMappingDto,
    BulkImportInventoryResult,
} from "@/features/inventory/service";

const ACCEPTED_MIME_TYPES = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
const NONE_VALUE = "__none__";
const PREVIEW_ROW_COUNT = 5;

type OptionalField = "group" | "quantity" | "unit" | "unitCost" | "barcode";

interface CsvInventoryImportModalProps {
    open: boolean;
    onClose: () => void;
    isParsing: boolean;
    isImporting: boolean;
    onParse: (file: File) => Promise<ParseInventoryCsvResult>;
    onImport: (data: ImportCsvInventoryDto) => Promise<BulkImportInventoryResult>;
}

export const CsvInventoryImportModal: React.FC<CsvInventoryImportModalProps> = ({
    open,
    onClose,
    isParsing,
    isImporting,
    onParse,
    onImport,
}) => {
    const { t } = useTranslation("management");

    const [step, setStep] = useState<"upload" | "map">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parseResult, setParseResult] = useState<ParseInventoryCsvResult | null>(null);
    const [nameHeader, setNameHeader] = useState<string>("");
    const [optionalHeaders, setOptionalHeaders] = useState<Record<OptionalField, string>>({
        group: NONE_VALUE,
        quantity: NONE_VALUE,
        unit: NONE_VALUE,
        unitCost: NONE_VALUE,
        barcode: NONE_VALUE,
    });
    const [defaultGroupName, setDefaultGroupName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inFlightRef = useRef(false);

    const reset = () => {
        setStep("upload");
        setFile(null);
        setDragActive(false);
        setParseError(null);
        setParseResult(null);
        setNameHeader("");
        setOptionalHeaders({ group: NONE_VALUE, quantity: NONE_VALUE, unit: NONE_VALUE, unitCost: NONE_VALUE, barcode: NONE_VALUE });
        setDefaultGroupName("");
    };

    useEffect(() => {
        if (open) reset();
    }, [open]);

    const handleFile = (f: File) => {
        const looksLikeCsv = ACCEPTED_MIME_TYPES.includes(f.type) || /\.csv$/i.test(f.name);
        if (!looksLikeCsv) {
            toast.error(t("inventory_management.csv_import.invalid_file_type"));
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
            const result = await onParse(file);
            if (!result.headers.length || !result.rows.length) {
                setParseError(t("inventory_management.csv_import.no_rows_parsed"));
                return;
            }
            setParseResult(result);
            setNameHeader(result.suggestedMapping.name ?? "");
            setOptionalHeaders({
                group: result.suggestedMapping.group ?? NONE_VALUE,
                quantity: result.suggestedMapping.quantity ?? NONE_VALUE,
                unit: result.suggestedMapping.unit ?? NONE_VALUE,
                unitCost: result.suggestedMapping.unitCost ?? NONE_VALUE,
                barcode: result.suggestedMapping.barcode ?? NONE_VALUE,
            });
            setStep("map");
        } catch (err: any) {
            setParseError(t("inventory_management.csv_import.parse_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    const updateOptional = (field: OptionalField, value: string) => {
        setOptionalHeaders((prev) => ({ ...prev, [field]: value }));
    };

    const handleImport = async () => {
        if (inFlightRef.current || !parseResult) return;
        if (!nameHeader) {
            toast.error(t("inventory_management.csv_import.missing_name_mapping"));
            return;
        }
        inFlightRef.current = true;

        const mapping: CsvColumnMappingDto = { name: nameHeader };
        (Object.keys(optionalHeaders) as OptionalField[]).forEach((field) => {
            const value = optionalHeaders[field];
            if (value !== NONE_VALUE) mapping[field] = value;
        });

        const payload: ImportCsvInventoryDto = {
            headers: parseResult.headers,
            rows: parseResult.rows,
            mapping,
            defaultGroupName: defaultGroupName.trim() || undefined,
        };

        try {
            const result = await onImport(payload);
            toast.success(
                t("inventory_management.csv_import.import_success", {
                    count: result.items,
                    groups: result.groups,
                }),
            );
            onClose();
        } catch (err: any) {
            toast.error(t("inventory_management.csv_import.import_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    const optionalFieldConfig: { field: OptionalField; labelKey: string }[] = [
        { field: "group", labelKey: "inventory_management.csv_import.field_group" },
        { field: "quantity", labelKey: "inventory_management.csv_import.field_quantity" },
        { field: "unit", labelKey: "inventory_management.csv_import.field_unit" },
        { field: "unitCost", labelKey: "inventory_management.csv_import.field_unit_cost" },
        { field: "barcode", labelKey: "inventory_management.csv_import.field_barcode" },
    ];

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                        {step === "upload"
                            ? t("inventory_management.csv_import.title")
                            : t("inventory_management.csv_import.map_title")}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "upload"
                            ? t("inventory_management.csv_import.description")
                            : t("inventory_management.csv_import.map_desc")}
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
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                                    : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-400",
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
                            <p className="text-sm font-medium">
                                {t("inventory_management.csv_import.drop_hint")}
                            </p>
                            <p className="text-xs text-zinc-500">
                                {file ? file.name : t("inventory_management.csv_import.file_hint")}
                            </p>
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
                                {t("inventory_management.csv_import.clear_file")}
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
                                <span>{t("inventory_management.csv_import.heuristic_notice")}</span>
                            </div>
                        )}

                        <p className="text-sm text-zinc-500">
                            {t("inventory_management.csv_import.rows_detected", { count: parseResult.rowCount })}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>
                                    {t("inventory_management.csv_import.field_name")}
                                    <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Select value={nameHeader} onValueChange={setNameHeader}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("inventory_management.csv_import.select_column")} />
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

                            {optionalFieldConfig.map(({ field, labelKey }) => (
                                <div key={field} className="space-y-1.5">
                                    <Label>{t(labelKey)}</Label>
                                    <Select
                                        value={optionalHeaders[field]}
                                        onValueChange={(value) => updateOptional(field, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE_VALUE}>
                                                {t("inventory_management.csv_import.none_option")}
                                            </SelectItem>
                                            {parseResult.headers.map((h) => (
                                                <SelectItem key={h} value={h}>
                                                    {h}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        {optionalHeaders.group === NONE_VALUE && (
                            <div className="space-y-1.5">
                                <Label>{t("inventory_management.csv_import.default_group_label")}</Label>
                                <Input
                                    value={defaultGroupName}
                                    onChange={(e) => setDefaultGroupName(e.target.value)}
                                    placeholder={t("inventory_management.csv_import.default_group_placeholder")}
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-500">
                                {t("inventory_management.csv_import.preview_title")}
                            </Label>
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

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    {step === "map" && (
                        <Button variant="outline" onClick={() => setStep("upload")} disabled={isImporting}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {t("inventory_management.csv_import.back")}
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={isParsing || isImporting}>
                        {t("shared.actions.cancel")}
                    </Button>
                    {step === "upload" ? (
                        <Button onClick={handleParse} disabled={!file || isParsing}>
                            {isParsing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isParsing
                                ? t("inventory_management.csv_import.parsing")
                                : t("inventory_management.csv_import.parse_button")}
                        </Button>
                    ) : (
                        <Button onClick={handleImport} disabled={isImporting || !nameHeader}>
                            {isImporting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isImporting
                                ? t("inventory_management.csv_import.importing")
                                : t("inventory_management.csv_import.import_button")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
