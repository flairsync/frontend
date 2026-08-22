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
import { Loader2, Sparkles, FileSpreadsheet, Upload, X, Trash2, ArrowLeft, ImageOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    ParsedInventory,
    BulkImportInventoryDto,
    BulkImportInventoryResult,
    ParseInventoryCsvResult,
    ImportCsvInventoryDto,
    CsvColumnMappingDto,
} from "@/features/inventory/service";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif)$/i;
const CSV_MIME_TYPES = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
const CSV_EXT_RE = /\.csv$/i;
const NONE_VALUE = "__none__";
const PREVIEW_ROW_COUNT = 5;

type FileKind = "image" | "csv";

const detectFileKind = (f: File): FileKind | null => {
    if (IMAGE_MIME_TYPES.includes(f.type) || IMAGE_EXT_RE.test(f.name)) return "image";
    if (CSV_MIME_TYPES.includes(f.type) || CSV_EXT_RE.test(f.name)) return "csv";
    return null;
};

// Must match INVENTORY_UNIT_CODES in flairsync-api's gemini.service.ts / the
// seeded inventory_units table (SeedInventoryUnits) — kept in sync manually
// since this is a small, rarely-changing fixed list shared across the stack.
const UNIT_OPTIONS: { code: string; label: string }[] = [
    { code: "g", label: "Gram (g)" },
    { code: "kg", label: "Kilogram (kg)" },
    { code: "oz", label: "Ounce (oz)" },
    { code: "lb", label: "Pound (lb)" },
    { code: "ml", label: "Milliliter (ml)" },
    { code: "l", label: "Liter (l)" },
    { code: "fl oz", label: "Fluid Ounce (fl oz)" },
    { code: "cup", label: "Cup" },
    { code: "tbsp", label: "Tablespoon (tbsp)" },
    { code: "tsp", label: "Teaspoon (tsp)" },
    { code: "pc", label: "Piece (pc)" },
    { code: "doz", label: "Dozen (doz)" },
    { code: "pack", label: "Pack" },
    { code: "box", label: "Box" },
    { code: "bottle", label: "Bottle" },
    { code: "can", label: "Can" },
    { code: "mm", label: "Millimeter (mm)" },
    { code: "m", label: "Meter (m)" },
    { code: "in", label: "Inch (in)" },
];

type DraftItem = { key: string; name: string; quantity: number; unit: string };
type DraftGroup = { key: string; name: string; items: DraftItem[] };

const toDraft = (parsed: ParsedInventory): DraftGroup[] =>
    (parsed.groups || []).map((group) => ({
        key: crypto.randomUUID(),
        name: group.name || "",
        items: (group.items || []).map((item) => ({
            key: crypto.randomUUID(),
            name: item.name || "",
            quantity: typeof item.quantity === "number" ? item.quantity : 0,
            unit: item.unit || "pc",
        })),
    }));

type CsvOptionalField = "group" | "quantity" | "unit" | "unitCost" | "barcode";

interface InventoryImportModalProps {
    open: boolean;
    onClose: () => void;
    isParsingImage: boolean;
    isImportingImage: boolean;
    onParseImage: (file: File) => Promise<ParsedInventory>;
    onImportImage: (data: BulkImportInventoryDto) => Promise<BulkImportInventoryResult>;
    isParsingCsv: boolean;
    isImportingCsv: boolean;
    onParseCsv: (file: File) => Promise<ParseInventoryCsvResult>;
    onImportCsv: (data: ImportCsvInventoryDto) => Promise<BulkImportInventoryResult>;
}

export const InventoryImportModal: React.FC<InventoryImportModalProps> = ({
    open,
    onClose,
    isParsingImage,
    isImportingImage,
    onParseImage,
    onImportImage,
    isParsingCsv,
    isImportingCsv,
    onParseCsv,
    onImportCsv,
}) => {
    const { t } = useTranslation("management");

    const [step, setStep] = useState<"upload" | "review" | "map">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [fileKind, setFileKind] = useState<FileKind | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Guards against double/triple-clicking before React re-renders the `disabled` prop.
    const inFlightRef = useRef(false);

    // Image (AI scan) review state
    const [groups, setGroups] = useState<DraftGroup[]>([]);

    // CSV mapping state
    const [csvResult, setCsvResult] = useState<ParseInventoryCsvResult | null>(null);
    const [nameHeader, setNameHeader] = useState<string>("");
    const [optionalHeaders, setOptionalHeaders] = useState<Record<CsvOptionalField, string>>({
        group: NONE_VALUE,
        quantity: NONE_VALUE,
        unit: NONE_VALUE,
        unitCost: NONE_VALUE,
        barcode: NONE_VALUE,
    });
    const [defaultGroupName, setDefaultGroupName] = useState("");

    const reset = () => {
        setStep("upload");
        setFile(null);
        setFileKind(null);
        setPreviewUrl(null);
        setDragActive(false);
        setParseError(null);
        setGroups([]);
        setCsvResult(null);
        setNameHeader("");
        setOptionalHeaders({ group: NONE_VALUE, quantity: NONE_VALUE, unit: NONE_VALUE, unitCost: NONE_VALUE, barcode: NONE_VALUE });
        setDefaultGroupName("");
    };

    useEffect(() => {
        if (open) reset();
    }, [open]);

    useEffect(() => {
        if (!file || fileKind !== "image") {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file, fileKind]);

    const handleFile = (f: File) => {
        const kind = detectFileKind(f);
        if (!kind) {
            toast.error(t("inventory_management.import_modal.invalid_file_type"));
            return;
        }
        setParseError(null);
        setFileKind(kind);
        setFile(f);
    };

    const isParsing = fileKind === "csv" ? isParsingCsv : isParsingImage;
    const isImporting = step === "map" ? isImportingCsv : isImportingImage;

    const handleParse = async () => {
        if (!file || !fileKind || inFlightRef.current) return;
        inFlightRef.current = true;
        setParseError(null);
        try {
            if (fileKind === "image") {
                const parsed = await onParseImage(file);
                const draft = toDraft(parsed);
                if (draft.every((g) => g.items.length === 0)) {
                    setParseError(t("inventory_management.ai_import.no_items_parsed"));
                    return;
                }
                setGroups(draft);
                setStep("review");
            } else {
                const result = await onParseCsv(file);
                if (!result.headers.length || !result.rows.length) {
                    setParseError(t("inventory_management.csv_import.no_rows_parsed"));
                    return;
                }
                setCsvResult(result);
                setNameHeader(result.suggestedMapping.name ?? "");
                setOptionalHeaders({
                    group: result.suggestedMapping.group ?? NONE_VALUE,
                    quantity: result.suggestedMapping.quantity ?? NONE_VALUE,
                    unit: result.suggestedMapping.unit ?? NONE_VALUE,
                    unitCost: result.suggestedMapping.unitCost ?? NONE_VALUE,
                    barcode: result.suggestedMapping.barcode ?? NONE_VALUE,
                });
                setStep("map");
            }
        } catch (err: any) {
            const code = err?.response?.data?.code;
            if (fileKind === "image" && code === "inventory.ai.unavailable") {
                toast.error(t("inventory_management.ai_import.unavailable_desc"), { duration: 6000 });
            } else if (fileKind === "image") {
                setParseError(t("inventory_management.ai_import.parse_error"));
            } else {
                setParseError(t("inventory_management.csv_import.parse_error"));
            }
        } finally {
            inFlightRef.current = false;
        }
    };

    // ── Image review helpers ──────────────────────────────────────────────
    const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

    const updateGroupName = (groupKey: string, name: string) => {
        setGroups((prev) => prev.map((g) => (g.key === groupKey ? { ...g, name } : g)));
    };
    const removeGroup = (groupKey: string) => {
        setGroups((prev) => prev.filter((g) => g.key !== groupKey));
    };
    const updateItem = (groupKey: string, itemKey: string, patch: Partial<DraftItem>) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.key !== groupKey ? g : { ...g, items: g.items.map((i) => (i.key === itemKey ? { ...i, ...patch } : i)) },
            ),
        );
    };
    const removeItem = (groupKey: string, itemKey: string) => {
        setGroups((prev) =>
            prev.map((g) => (g.key !== groupKey ? g : { ...g, items: g.items.filter((i) => i.key !== itemKey) })),
        );
    };

    const handleImportImage = async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        const payload: BulkImportInventoryDto = {
            groups: groups
                .filter((g) => g.name.trim() && g.items.length > 0)
                .map((g) => ({
                    name: g.name.trim(),
                    items: g.items
                        .filter((i) => i.name.trim())
                        .map((i) => ({ name: i.name.trim(), quantity: i.quantity, unit: i.unit })),
                })),
        };

        if (!payload.groups.length) {
            toast.error(t("inventory_management.ai_import.no_items_parsed"));
            inFlightRef.current = false;
            return;
        }

        try {
            await onImportImage(payload);
            toast.success(t("inventory_management.ai_import.import_success"));
            onClose();
        } catch (err: any) {
            toast.error(t("inventory_management.ai_import.import_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    // ── CSV mapping helpers ────────────────────────────────────────────────
    const updateOptional = (field: CsvOptionalField, value: string) => {
        setOptionalHeaders((prev) => ({ ...prev, [field]: value }));
    };

    const optionalFieldConfig: { field: CsvOptionalField; labelKey: string }[] = [
        { field: "group", labelKey: "inventory_management.csv_import.field_group" },
        { field: "quantity", labelKey: "inventory_management.csv_import.field_quantity" },
        { field: "unit", labelKey: "inventory_management.csv_import.field_unit" },
        { field: "unitCost", labelKey: "inventory_management.csv_import.field_unit_cost" },
        { field: "barcode", labelKey: "inventory_management.csv_import.field_barcode" },
    ];

    const handleImportCsv = async () => {
        if (inFlightRef.current || !csvResult) return;
        if (!nameHeader) {
            toast.error(t("inventory_management.csv_import.missing_name_mapping"));
            return;
        }
        inFlightRef.current = true;

        const mapping: CsvColumnMappingDto = { name: nameHeader };
        (Object.keys(optionalHeaders) as CsvOptionalField[]).forEach((field) => {
            const value = optionalHeaders[field];
            if (value !== NONE_VALUE) mapping[field] = value;
        });

        const payload: ImportCsvInventoryDto = {
            headers: csvResult.headers,
            rows: csvResult.rows,
            mapping,
            defaultGroupName: defaultGroupName.trim() || undefined,
        };

        try {
            const result = await onImportCsv(payload);
            toast.success(
                t("inventory_management.csv_import.import_success", { count: result.items, groups: result.groups }),
            );
            onClose();
        } catch (err: any) {
            toast.error(t("inventory_management.csv_import.import_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    const handleImport = () => {
        if (step === "map") return handleImportCsv();
        return handleImportImage();
    };

    const titleIcon =
        step === "map" ? (
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
        ) : (
            <Sparkles className="h-5 w-5 text-indigo-500" />
        );

    const title =
        step === "upload"
            ? t("inventory_management.import_modal.title")
            : step === "review"
              ? t("inventory_management.ai_import.review_title")
              : t("inventory_management.csv_import.map_title");

    const description =
        step === "upload"
            ? t("inventory_management.import_modal.description")
            : step === "review"
              ? t("inventory_management.ai_import.review_desc")
              : t("inventory_management.csv_import.map_desc");

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="shrink-0 px-6 pb-4 pt-6 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        {titleIcon}
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
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
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 min-h-[220px]",
                                dragActive
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400",
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={[...IMAGE_MIME_TYPES, ...CSV_MIME_TYPES, ".jpg", ".jpeg", ".png", ".webp", ".gif", ".csv"].join(",")}
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                }}
                            />
                            {previewUrl ? (
                                <img src={previewUrl} alt={file?.name} className="max-h-48 rounded-md object-contain" />
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-zinc-400" />
                                    <p className="text-sm font-medium">{t("inventory_management.import_modal.drop_hint")}</p>
                                </>
                            )}
                            <p className="text-xs text-zinc-500">
                                {file ? file.name : t("inventory_management.import_modal.file_hint")}
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
                                    setFileKind(null);
                                }}
                            >
                                <X className="h-4 w-4 mr-1" />
                                {t("inventory_management.import_modal.clear_file")}
                            </Button>
                        )}

                        {parseError && <p className="text-sm text-red-600">{parseError}</p>}
                    </div>
                )}

                {step === "review" && (
                    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
                        {groups.length === 0 && (
                            <div className="flex flex-col items-center gap-2 text-zinc-500 py-8">
                                <ImageOff className="h-8 w-8" />
                                <p className="text-sm">{t("inventory_management.ai_import.no_items_parsed")}</p>
                            </div>
                        )}

                        {groups.map((group) => (
                            <div key={group.key} className="rounded-lg border p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={group.name}
                                        onChange={(e) => updateGroupName(group.key, e.target.value)}
                                        placeholder={t("inventory_management.ai_import.group_name")}
                                        className="font-semibold"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 shrink-0"
                                        onClick={() => removeGroup(group.key)}
                                        title={t("inventory_management.ai_import.remove_group")}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {group.items.map((item) => (
                                        <div key={item.key} className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-2">
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(group.key, item.key, { name: e.target.value })}
                                                        placeholder={t("inventory_management.ai_import.item_name")}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItem(group.key, item.key, { quantity: parseFloat(e.target.value) || 0 })
                                                            }
                                                            placeholder={t("inventory_management.ai_import.quantity")}
                                                            className="max-w-[120px]"
                                                        />
                                                        <Select
                                                            value={item.unit}
                                                            onValueChange={(value) => updateItem(group.key, item.key, { unit: value })}
                                                        >
                                                            <SelectTrigger className="max-w-[180px]">
                                                                <SelectValue placeholder={t("inventory_management.ai_import.unit")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {UNIT_OPTIONS.map((u) => (
                                                                    <SelectItem key={u.code} value={u.code}>
                                                                        {u.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 shrink-0"
                                                    onClick={() => removeItem(group.key, item.key)}
                                                    title={t("inventory_management.ai_import.remove_item")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === "map" && csvResult && (
                    <div className="flex-1 min-h-0 flex flex-col gap-4 px-6 py-4 overflow-hidden">
                        <div className="shrink-0 space-y-4">
                            {!csvResult.aiSuggested && (
                                <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-800 dark:text-amber-300">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{t("inventory_management.csv_import.heuristic_notice")}</span>
                                </div>
                            )}

                            <p className="text-sm text-zinc-500">
                                {t("inventory_management.csv_import.rows_detected", { count: csvResult.rowCount })}
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
                                            {csvResult.headers.map((h) => (
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
                                        <Select value={optionalHeaders[field]} onValueChange={(value) => updateOptional(field, value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={NONE_VALUE}>{t("inventory_management.csv_import.none_option")}</SelectItem>
                                                {csvResult.headers.map((h) => (
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
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                            <Label className="shrink-0 text-xs text-zinc-500">
                                {t("inventory_management.csv_import.preview_title")}
                            </Label>
                            <div className="flex-1 min-h-0 overflow-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {csvResult.headers.map((h) => (
                                                <TableHead key={h} className="whitespace-nowrap">
                                                    {h}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {csvResult.rows.slice(0, PREVIEW_ROW_COUNT).map((row, i) => (
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

                <DialogFooter className="shrink-0 px-6 pb-6 pt-4 border-t flex justify-end gap-2">
                    {step !== "upload" && (
                        <Button variant="outline" onClick={() => setStep("upload")} disabled={isImporting}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {t("inventory_management.ai_import.back")}
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={isParsing || isImporting}>
                        {t("shared.actions.cancel")}
                    </Button>
                    {step === "upload" ? (
                        <Button onClick={handleParse} disabled={!file || isParsing}>
                            {isParsing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isParsing
                                ? t("inventory_management.import_modal.analyzing")
                                : t("inventory_management.import_modal.analyze_button")}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleImport}
                            disabled={isImporting || (step === "review" ? totalItems === 0 : !nameHeader)}
                        >
                            {isImporting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {step === "review"
                                ? isImporting
                                    ? t("inventory_management.ai_import.importing")
                                    : t("inventory_management.ai_import.import_button")
                                : isImporting
                                  ? t("inventory_management.csv_import.importing")
                                  : t("inventory_management.csv_import.import_button")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
