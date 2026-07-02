import { useEffect, useState, ChangeEvent } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPickerInput } from "@/components/inputs/ColorPickerInput";
import { useQrDesign } from "@/features/qr/useQrDesign";
import { CornersDotType, CornersSquareType, DotsType, UpdateQrDesignDto } from "@/features/qr/service";
import QrLivePreview from "@/components/qr/QrLivePreview";
import { X, Loader2 } from "lucide-react";

const DOTS_TYPES: DotsType[] = ["square", "dots", "rounded", "classy", "classy-rounded", "extra-rounded"];
const CORNERS_SQUARE_TYPES: CornersSquareType[] = ["square", "dot", "extra-rounded"];
const CORNERS_DOT_TYPES: CornersDotType[] = ["square", "dot"];

// `design` (and therefore `local`, seeded from it) carries `id`/`businessId`/`logoUrl`
// too — TS's `UpdateQrDesignDto` type doesn't actually strip those at runtime. Build
// the PATCH payload explicitly so a stale `logoUrl` never rides along and clobbers a
// logo we just uploaded in the same Save click.
const toUpdatePayload = (local: UpdateQrDesignDto): UpdateQrDesignDto => ({
    dotsColor: local.dotsColor,
    backgroundColor: local.backgroundColor,
    cornersSquareColor: local.cornersSquareColor,
    cornersDotColor: local.cornersDotColor,
    dotsType: local.dotsType,
    cornersSquareType: local.cornersSquareType,
    cornersDotType: local.cornersDotType,
    logoSize: local.logoSize,
    logoMargin: local.logoMargin,
    margin: local.margin,
});

interface QrDesignEditorProps {
    businessId: string;
}

export default function QrDesignEditor({ businessId }: QrDesignEditorProps) {
    const { design, updateDesignAsync, uploadLogoAsync, deleteLogoAsync, isSaving } = useQrDesign(businessId);

    // Everything below is edited purely in local state — nothing is sent to the
    // backend until "Save" is clicked, instead of firing a request per field change.
    const [local, setLocal] = useState<UpdateQrDesignDto | null>(null);
    const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
    const [pendingLogoDataUrl, setPendingLogoDataUrl] = useState<string | null>(null);
    const [removeLogoPending, setRemoveLogoPending] = useState(false);

    useEffect(() => {
        if (design && !local) {
            setLocal(design);
        }
    }, [design, local]);

    const updateLocal = (partial: UpdateQrDesignDto) => {
        setLocal((prev) => ({ ...prev, ...partial }));
    };

    const handleLogoFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setPendingLogoFile(file);
            setPendingLogoDataUrl(reader.result as string);
            setRemoveLogoPending(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        if (pendingLogoFile) {
            setPendingLogoFile(null);
            setPendingLogoDataUrl(null);
        } else {
            setRemoveLogoPending(true);
        }
    };

    const handleSave = async () => {
        try {
            if (pendingLogoFile) {
                await uploadLogoAsync(pendingLogoFile);
            } else if (removeLogoPending) {
                await deleteLogoAsync();
            }
            if (local) {
                await updateDesignAsync(toUpdatePayload(local));
            }
            setPendingLogoFile(null);
            setPendingLogoDataUrl(null);
            setRemoveLogoPending(false);
            toast.success("QR design saved");
        } catch {
            toast.error("Failed to save QR design");
        }
    };

    if (!local) {
        return <p className="text-sm text-muted-foreground">Loading QR design...</p>;
    }

    const previewOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const effectiveLogo = pendingLogoDataUrl ?? (removeLogoPending ? undefined : design?.logoUrl);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ColorPickerInput
                            label="Dots color"
                            value={local.dotsColor ?? "#000000"}
                            onChange={(hex) => updateLocal({ dotsColor: hex })}
                        />
                        <ColorPickerInput
                            label="Background color"
                            value={local.backgroundColor ?? "#FFFFFF"}
                            onChange={(hex) => updateLocal({ backgroundColor: hex })}
                        />
                        <ColorPickerInput
                            label="Corners square color"
                            value={local.cornersSquareColor || local.dotsColor || "#000000"}
                            onChange={(hex) => updateLocal({ cornersSquareColor: hex })}
                        />
                        <ColorPickerInput
                            label="Corners dot color"
                            value={local.cornersDotColor || local.dotsColor || "#000000"}
                            onChange={(hex) => updateLocal({ cornersDotColor: hex })}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Dots style</Label>
                            <Select value={local.dotsType} onValueChange={(val: DotsType) => updateLocal({ dotsType: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {DOTS_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Corners square style</Label>
                            <Select value={local.cornersSquareType} onValueChange={(val: CornersSquareType) => updateLocal({ cornersSquareType: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CORNERS_SQUARE_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Corners dot style</Label>
                            <Select value={local.cornersDotType} onValueChange={(val: CornersDotType) => updateLocal({ cornersDotType: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CORNERS_DOT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Logo size ({Math.round((local.logoSize ?? 0.4) * 100)}%)</Label>
                            <Slider
                                min={0.1}
                                max={0.6}
                                step={0.01}
                                value={[local.logoSize ?? 0.4]}
                                onValueChange={([val]) => updateLocal({ logoSize: val })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Quiet zone margin ({local.margin ?? 10}px)</Label>
                            <Slider
                                min={0}
                                max={50}
                                step={1}
                                value={[local.margin ?? 10]}
                                onValueChange={([val]) => updateLocal({ margin: val })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <div className="space-y-0.5">
                            <Label>Clear dots behind logo</Label>
                            <p className="text-xs text-muted-foreground">Keeps the logo readable by hiding QR dots directly behind it</p>
                        </div>
                        <Switch
                            checked={local.logoMargin ?? true}
                            onCheckedChange={(val) => updateLocal({ logoMargin: val })}
                        />
                    </div>

                    <Card>
                        <CardContent className="flex items-center gap-4 pt-6">
                            {effectiveLogo ? (
                                <img src={effectiveLogo} alt="QR logo" className="h-16 w-16 rounded border object-contain" />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded border text-xs text-muted-foreground">
                                    No logo
                                </div>
                            )}
                            <div className="flex flex-1 items-center gap-2">
                                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoFile} />
                                {effectiveLogo && (
                                    <Button variant="outline" size="icon" onClick={handleRemoveLogo}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col items-center gap-2 justify-self-center md:justify-self-end">
                    <span className="text-sm font-medium text-muted-foreground">Live preview</span>
                    <div className="rounded-lg border p-4">
                        <QrLivePreview
                            value={`${previewOrigin}/diner/${businessId}`}
                            dotsColor={local.dotsColor ?? "#000000"}
                            backgroundColor={local.backgroundColor ?? "#FFFFFF"}
                            cornersSquareColor={local.cornersSquareColor}
                            cornersDotColor={local.cornersDotColor}
                            dotsType={local.dotsType ?? "square"}
                            cornersSquareType={local.cornersSquareType ?? "square"}
                            cornersDotType={local.cornersDotType ?? "square"}
                            logoUrl={effectiveLogo}
                            logoSize={local.logoSize ?? 0.4}
                            logoMargin={local.logoMargin ?? true}
                            margin={local.margin ?? 10}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </div>
        </div>
    );
}
