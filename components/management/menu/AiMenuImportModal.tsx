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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Upload, X, Trash2, ArrowLeft, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Allergy } from "@/models/shared/Allergy";
import { ParsedMenu, BulkImportMenuDto, BulkImportMenuResult } from "@/features/business/menu/service";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type DraftItem = {
    key: string;
    name: string;
    description: string;
    price: number;
    allergens: string[];
};

type DraftCategory = {
    key: string;
    name: string;
    items: DraftItem[];
};

const toDraft = (parsed: ParsedMenu): DraftCategory[] =>
    (parsed.categories || []).map((cat) => ({
        key: crypto.randomUUID(),
        name: cat.name || "",
        items: (cat.items || []).map((item) => ({
            key: crypto.randomUUID(),
            name: item.name || "",
            description: item.description || "",
            price: typeof item.price === "number" ? item.price : 0,
            allergens: item.allergens || [],
        })),
    }));

interface AiMenuImportModalProps {
    open: boolean;
    onClose: () => void;
    allergies: Allergy[];
    remainingProductSlots?: number;
    isParsing: boolean;
    isImporting: boolean;
    onParse: (file: File) => Promise<ParsedMenu>;
    onImport: (data: BulkImportMenuDto) => Promise<BulkImportMenuResult>;
}

export const AiMenuImportModal: React.FC<AiMenuImportModalProps> = ({
    open,
    onClose,
    allergies,
    remainingProductSlots,
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
    const [unavailable, setUnavailable] = useState(false);
    const [categories, setCategories] = useState<DraftCategory[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep("upload");
        setFile(null);
        setPreviewUrl(null);
        setDragActive(false);
        setParseError(null);
        setUnavailable(false);
        setCategories([]);
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

    const allergyNameByCode = (code: string) =>
        allergies.find((a) => a.code === code)?.name || code;

    const handleFile = (f: File) => {
        if (!ACCEPTED_MIME_TYPES.includes(f.type)) {
            toast.error(t("menu_management.ai_import.invalid_file_type"));
            return;
        }
        setParseError(null);
        setUnavailable(false);
        setFile(f);
    };

    const handleParse = async () => {
        if (!file) return;
        setParseError(null);
        setUnavailable(false);
        try {
            const parsed = await onParse(file);
            const draft = toDraft(parsed);
            if (draft.every((cat) => cat.items.length === 0)) {
                setParseError(t("menu_management.ai_import.no_items_parsed"));
                return;
            }
            setCategories(draft);
            setStep("review");
        } catch (err: any) {
            const code = err?.response?.data?.code;
            if (code === "menu.ai.unavailable") {
                setUnavailable(true);
            } else {
                setParseError(t("menu_management.ai_import.parse_error"));
            }
        }
    };

    const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

    const updateCategoryName = (catKey: string, name: string) => {
        setCategories((prev) =>
            prev.map((c) => (c.key === catKey ? { ...c, name } : c)),
        );
    };

    const removeCategory = (catKey: string) => {
        setCategories((prev) => prev.filter((c) => c.key !== catKey));
    };

    const updateItem = (catKey: string, itemKey: string, patch: Partial<DraftItem>) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.key !== catKey
                    ? c
                    : {
                        ...c,
                        items: c.items.map((i) => (i.key === itemKey ? { ...i, ...patch } : i)),
                    },
            ),
        );
    };

    const removeItem = (catKey: string, itemKey: string) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.key !== catKey ? c : { ...c, items: c.items.filter((i) => i.key !== itemKey) },
            ),
        );
    };

    const removeAllergen = (catKey: string, itemKey: string, code: string) => {
        setCategories((prev) =>
            prev.map((c) =>
                c.key !== catKey
                    ? c
                    : {
                        ...c,
                        items: c.items.map((i) =>
                            i.key !== itemKey
                                ? i
                                : { ...i, allergens: i.allergens.filter((a) => a !== code) },
                        ),
                    },
            ),
        );
    };

    const handleImport = async () => {
        const payload: BulkImportMenuDto = {
            categories: categories
                .filter((c) => c.name.trim() && c.items.length > 0)
                .map((c) => ({
                    name: c.name.trim(),
                    items: c.items
                        .filter((i) => i.name.trim())
                        .map((i) => ({
                            name: i.name.trim(),
                            description: i.description.trim() || undefined,
                            price: i.price,
                            allergens: i.allergens,
                        })),
                })),
        };

        if (!payload.categories.length) {
            toast.error(t("menu_management.ai_import.no_items_parsed"));
            return;
        }

        try {
            const result = await onImport(payload);
            if (result.skipped > 0) {
                toast.success(
                    t("menu_management.ai_import.import_partial", { skipped: result.skipped }),
                );
            } else {
                toast.success(t("menu_management.ai_import.import_success"));
            }
            onClose();
        } catch (err: any) {
            toast.error(t("menu_management.ai_import.import_error"));
        }
    };

    const exceedsLimit =
        typeof remainingProductSlots === "number" && totalItems > remainingProductSlots;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        {step === "upload"
                            ? t("menu_management.ai_import.title")
                            : t("menu_management.ai_import.review_title")}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "upload"
                            ? t("menu_management.ai_import.description")
                            : t("menu_management.ai_import.review_desc")}
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="space-y-4 mt-2">
                        {unavailable ? (
                            <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
                                <p className="font-medium">
                                    {t("menu_management.ai_import.unavailable_title")}
                                </p>
                                <p className="mt-1">
                                    {t("menu_management.ai_import.unavailable_desc")}
                                </p>
                            </div>
                        ) : (
                            <>
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
                                                {t("menu_management.ai_import.drop_hint")}
                                            </p>
                                        </>
                                    )}
                                    <p className="text-xs text-zinc-500">
                                        {file ? file.name : t("menu_management.ai_import.file_hint")}
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
                                        {t("menu_management.ai_import.clear_file")}
                                    </Button>
                                )}

                                {parseError && (
                                    <p className="text-sm text-red-600">{parseError}</p>
                                )}
                            </>
                        )}
                    </div>
                )}

                {step === "review" && (
                    <div className="space-y-6 mt-2">
                        {exceedsLimit && (
                            <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                                {t("menu_management.ai_import.limit_warning", {
                                    remaining: remainingProductSlots,
                                    skipped: totalItems - (remainingProductSlots || 0),
                                })}
                            </div>
                        )}

                        {categories.length === 0 && (
                            <div className="flex flex-col items-center gap-2 text-zinc-500 py-8">
                                <ImageOff className="h-8 w-8" />
                                <p className="text-sm">{t("menu_management.ai_import.no_items_parsed")}</p>
                            </div>
                        )}

                        {categories.map((cat) => (
                            <div key={cat.key} className="rounded-lg border p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={cat.name}
                                        onChange={(e) => updateCategoryName(cat.key, e.target.value)}
                                        placeholder={t("menu_management.ai_import.category_name")}
                                        className="font-semibold"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 shrink-0"
                                        onClick={() => removeCategory(cat.key)}
                                        title={t("menu_management.ai_import.remove_category")}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {cat.items.map((item) => (
                                        <div
                                            key={item.key}
                                            className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-2"
                                        >
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) =>
                                                            updateItem(cat.key, item.key, { name: e.target.value })
                                                        }
                                                        placeholder={t("menu_management.ai_import.item_name")}
                                                    />
                                                    <Textarea
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateItem(cat.key, item.key, {
                                                                description: e.target.value,
                                                            })
                                                        }
                                                        placeholder={t("item_modal.description")}
                                                        rows={2}
                                                    />
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min={0}
                                                        value={item.price}
                                                        onChange={(e) =>
                                                            updateItem(cat.key, item.key, {
                                                                price: parseFloat(e.target.value) || 0,
                                                            })
                                                        }
                                                        placeholder={t("item_modal.price")}
                                                        className="max-w-[140px]"
                                                    />
                                                    {item.allergens.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.allergens.map((code) => (
                                                                <Badge
                                                                    key={code}
                                                                    variant="secondary"
                                                                    className="gap-1 cursor-pointer"
                                                                    onClick={() =>
                                                                        removeAllergen(cat.key, item.key, code)
                                                                    }
                                                                >
                                                                    {allergyNameByCode(code)}
                                                                    <X className="h-3 w-3" />
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 shrink-0"
                                                    onClick={() => removeItem(cat.key, item.key)}
                                                    title={t("menu_management.ai_import.remove_item")}
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
                            {t("menu_management.ai_import.back")}
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={isParsing || isImporting}>
                        {t("shared.actions.cancel")}
                    </Button>
                    {step === "upload" ? (
                        <Button onClick={handleParse} disabled={!file || isParsing || unavailable}>
                            {isParsing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isParsing
                                ? t("menu_management.ai_import.parsing")
                                : t("menu_management.ai_import.parse_button")}
                        </Button>
                    ) : (
                        <Button onClick={handleImport} disabled={isImporting || categories.length === 0}>
                            {isImporting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {isImporting
                                ? t("menu_management.ai_import.importing")
                                : t("menu_management.ai_import.import_button")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
