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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Upload, X, Trash2, ArrowLeft, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    ParsedInventory,
    BulkImportInventoryDto,
    BulkImportInventoryResult,
} from "@/features/inventory/service";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

type DraftItem = {
    key: string;
    name: string;
    quantity: number;
    unit: string;
};

type DraftGroup = {
    key: string;
    name: string;
    items: DraftItem[];
};

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

interface AiInventoryImportModalProps {
    open: boolean;
    onClose: () => void;
    isParsing: boolean;
    isImporting: boolean;
    onParse: (file: File) => Promise<ParsedInventory>;
    onImport: (data: BulkImportInventoryDto) => Promise<BulkImportInventoryResult>;
}

export const AiInventoryImportModal: React.FC<AiInventoryImportModalProps> = ({
    open,
    onClose,
    isParsing,
    isImporting,
    onParse,
    onImport,
}) => {
    const { t } = useTranslation("management");

    const [step, setStep] = useState<"upload" | "review">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [groups, setGroups] = useState<DraftGroup[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Guards against double/triple-clicking before React re-renders the
    // `disabled` prop — see AiMenuImportModal for the same pattern/rationale.
    const inFlightRef = useRef(false);

    const reset = () => {
        setStep("upload");
        setFile(null);
        setPreviewUrl(null);
        setDragActive(false);
        setParseError(null);
        setGroups([]);
    };

    useEffect(() => {
        if (open) reset();
    }, [open]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleFile = (f: File) => {
        if (!ACCEPTED_MIME_TYPES.includes(f.type)) {
            toast.error(t("inventory_management.ai_import.invalid_file_type"));
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
            const draft = toDraft(parsed);
            if (draft.every((g) => g.items.length === 0)) {
                setParseError(t("inventory_management.ai_import.no_items_parsed"));
                return;
            }
            setGroups(draft);
            setStep("review");
        } catch (err: any) {
            const code = err?.response?.data?.code;
            if (code === "inventory.ai.unavailable") {
                toast.error(t("inventory_management.ai_import.unavailable_desc"), {
                    duration: 6000,
                });
            } else {
                setParseError(t("inventory_management.ai_import.parse_error"));
            }
        } finally {
            inFlightRef.current = false;
        }
    };

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
                g.key !== groupKey
                    ? g
                    : { ...g, items: g.items.map((i) => (i.key === itemKey ? { ...i, ...patch } : i)) },
            ),
        );
    };

    const removeItem = (groupKey: string, itemKey: string) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.key !== groupKey ? g : { ...g, items: g.items.filter((i) => i.key !== itemKey) },
            ),
        );
    };

    const handleImport = async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        const payload: BulkImportInventoryDto = {
            groups: groups
                .filter((g) => g.name.trim() && g.items.length > 0)
                .map((g) => ({
                    name: g.name.trim(),
                    items: g.items
                        .filter((i) => i.name.trim())
                        .map((i) => ({
                            name: i.name.trim(),
                            quantity: i.quantity,
                            unit: i.unit,
                        })),
                })),
        };

        if (!payload.groups.length) {
            toast.error(t("inventory_management.ai_import.no_items_parsed"));
            inFlightRef.current = false;
            return;
        }

        try {
            await onImport(payload);
            toast.success(t("inventory_management.ai_import.import_success"));
            onClose();
        } catch (err: any) {
            toast.error(t("inventory_management.ai_import.import_error"));
        } finally {
            inFlightRef.current = false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        {step === "upload"
                            ? t("inventory_management.ai_import.title")
                            : t("inventory_management.ai_import.review_title")}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "upload"
                            ? t("inventory_management.ai_import.description")
                            : t("inventory_management.ai_import.review_desc")}
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
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 min-h-[220px]",
                                dragActive
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400",
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_MIME_TYPES.join(",")}
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                }}
                            />
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={file?.name}
                                    className="max-h-48 rounded-md object-contain"
                                />
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-zinc-400" />
                                    <p className="text-sm font-medium">
                                        {t("inventory_management.ai_import.drop_hint")}
                                    </p>
                                </>
                            )}
                            <p className="text-xs text-zinc-500">
                                {file ? file.name : t("inventory_management.ai_import.file_hint")}
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
                                {t("inventory_management.ai_import.clear_file")}
                            </Button>
                        )}

                        {parseError && <p className="text-sm text-red-600">{parseError}</p>}
                    </div>
                )}

                {step === "review" && (
                    <div className="space-y-6 mt-2">
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
                                        <div
                                            key={item.key}
                                            className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-2"
                                        >
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) =>
                                                            updateItem(group.key, item.key, { name: e.target.value })
                                                        }
                                                        placeholder={t("inventory_management.ai_import.item_name")}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItem(group.key, item.key, {
                                                                    quantity: parseFloat(e.target.value) || 0,
                                                                })
                                                            }
                                                            placeholder={t("inventory_management.ai_import.quantity")}
                                                            className="max-w-[120px]"
                                                        />
                                                        <Select
                                                            value={item.unit}
                                                            onValueChange={(value) =>
                                                                updateItem(group.key, item.key, { unit: value })
                                                            }
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

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    {step === "review" && (
                        <Button
                            variant="outline"
                            onClick={() => setStep("upload")}
                            disabled={isImporting}
                        >
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
                                ? t("inventory_management.ai_import.scanning")
                                : t("inventory_management.ai_import.scan_button")}
                        </Button>
                    ) : (
                        <Button onClick={handleImport} disabled={isImporting || totalItems === 0}>
                            {isImporting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isImporting
                                ? t("inventory_management.ai_import.importing")
                                : t("inventory_management.ai_import.import_button")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
