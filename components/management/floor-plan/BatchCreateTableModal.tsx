import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BatchCreateTableDto } from "@/features/floor-plan/service";
import { ArrowLeft, Trash2, Check, Sparkles } from "lucide-react";

interface BatchCreateTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    floors: any[];
    existingTables: any[];
    onBatchCreate: (data: BatchCreateTableDto) => void;
    isCreating: boolean;
}

interface TableConfig {
    name: string;
    number: number;
    capacity: number;
    status: string;
    position: { x: number; y: number; shape: "circle" | "square" | "rectangle" };
}

export const BatchCreateTableModal: React.FC<BatchCreateTableModalProps> = ({
    isOpen,
    onClose,
    floors,
    existingTables,
    onBatchCreate,
    isCreating
}) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<"config" | "review">("config");

    // Config Step State
    const [config, setConfig] = useState({
        floorId: "",
        count: 5,
        startNumber: 1,
        capacity: 2,
        prefix: "Table",
        status: "available",
        shape: "square" as "circle" | "square" | "rectangle"
    });

    // Review Step State
    const [generatedTables, setGeneratedTables] = useState<TableConfig[]>([]);

    const getNextAvailableNumber = (start: number): number => {
        let current = start;
        const usedNumbers = new Set(existingTables.map(t => t.number));
        while (usedNumbers.has(current)) {
            current++;
        }
        return current;
    };

    const handleGenerate = () => {
        if (!config.floorId) {
            toast.error("Please select a floor");
            return;
        }

        const tables: TableConfig[] = [];
        let currentNumber = config.startNumber;

        for (let i = 0; i < config.count; i++) {
            // Find next available number (skipping existing ones)
            // We also need to check against the ones we just generated in this loop?
            // Actually, simplest is just increment, but let's be smart and skip taken ones if user wants?
            // But usually users expect sequential.
            // Let's check if the specific number is taken in existingTables, if so, we might want to warn or skip?
            // "The number should also be editable, but keep in mind to not use a already used number"
            // I will try to generate valid numbers by default.

            // Check if currentNumber is used in existingTables
            const usedInExisting = existingTables.some(t => t.number === currentNumber);
            // If used, find next free? Or just let it conflict and show error?
            // Auto-finding next free is better DX.
            while (existingTables.some(t => t.number === currentNumber)) {
                currentNumber++;
            }

            const row = Math.floor(i / 4); // 4 per row
            const col = i % 4;

            tables.push({
                name: `${config.prefix} ${currentNumber}`,
                number: currentNumber,
                capacity: config.capacity,
                status: config.status,
                position: {
                    x: 50 + (col * 120),
                    y: 50 + (row * 120),
                    shape: config.shape
                }
            });
            currentNumber++;
        }

        setGeneratedTables(tables);
        setStep("review");
    };

    const handleUpdateTableName = (index: number, value: string) => {
        const newTables = [...generatedTables];
        newTables[index].name = value;
        setGeneratedTables(newTables);
    };

    const handleUpdateTableNumber = (index: number, value: number) => {
        const newTables = [...generatedTables];
        newTables[index].number = value;
        setGeneratedTables(newTables);
    };

    const handleUpdateTableCapacity = (index: number, value: number) => {
        const newTables = [...generatedTables];
        newTables[index].capacity = value;
        setGeneratedTables(newTables);
    };

    const handleUpdateTableShape = (index: number, value: "circle" | "square" | "rectangle") => {
        const newTables = [...generatedTables];
        newTables[index].position.shape = value;
        setGeneratedTables(newTables);
    };

    const handleRemoveTable = (index: number) => {
        const newTables = [...generatedTables];
        newTables.splice(index, 1);
        setGeneratedTables(newTables);
    };

    const isNumberDuplicate = (num: number, index: number) => {
        // Check in existing tables
        if (existingTables.some(t => t.number === num)) return true;
        // Check in other generated tables
        if (generatedTables.some((t, i) => i !== index && t.number === num)) return true;
        return false;
    };

    const hasErrors = generatedTables.some((t, i) => isNumberDuplicate(t.number, i));

    const handleConfirm = () => {
        if (generatedTables.length === 0) {
            toast.error("No tables to create");
            return;
        }

        if (hasErrors) {
            toast.error("Please fix table number conflicts before creating.");
            return;
        }

        onBatchCreate({
            floorId: config.floorId,
            tables: generatedTables
        });

        onClose();
        setTimeout(() => {
            setStep("config");
            setGeneratedTables([]);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>{step === "config" ? "Batch Create Tables" : "Review Tables"}</DialogTitle>
                    <DialogDescription>
                        {step === "config"
                            ? "Configure settings to generate multiple tables."
                            : "Review and edit the generated tables before creating them."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
                    {step === "config" ? (
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="floor">Floor</Label>
                                <Select
                                    value={config.floorId}
                                    onValueChange={(val) => setConfig({ ...config, floorId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Floor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {floors.map((floor) => (
                                            <SelectItem key={floor.id} value={floor.id}>
                                                {floor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="count">Number of Tables</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={config.count}
                                        onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="startNumber">Starting Number</Label>
                                    <Input
                                        id="startNumber"
                                        type="number"
                                        min={1}
                                        value={config.startNumber}
                                        onChange={(e) => setConfig({ ...config, startNumber: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="capacity">Default Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min={1}
                                        value={config.capacity}
                                        onChange={(e) => setConfig({ ...config, capacity: parseInt(e.target.value) || 2 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="shape">Default Shape</Label>
                                    <Select
                                        value={config.shape}
                                        onValueChange={(val: any) => setConfig({ ...config, shape: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="circle">Circle</SelectItem>
                                            <SelectItem value="square">Square</SelectItem>
                                            <SelectItem value="rectangle">Rectangle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="prefix">Name Prefix</Label>
                                <Input
                                    id="prefix"
                                    value={config.prefix}
                                    onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                                    placeholder="e.g. Table"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {generatedTables.map((table, index) => {
                                const isError = isNumberDuplicate(table.number, index);
                                return (
                                    <Card key={index} className={`relative overflow-hidden border ${isError ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${isError ? 'bg-destructive' : 'bg-primary'}`} />
                                        <CardContent className="p-4 pl-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm">Table #{table.number}</h4>
                                                    {isError && <span className="text-xs text-destructive font-medium">Duplicate Number</span>}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                    onClick={() => handleRemoveTable(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                                <div className="space-y-1.5 sm:col-span-1">
                                                    <Label className="text-xs text-muted-foreground">Number</Label>
                                                    <Input
                                                        type="number"
                                                        value={table.number}
                                                        onChange={(e) => handleUpdateTableNumber(index, parseInt(e.target.value) || 0)}
                                                        className={`h-8 text-sm ${isError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                    />
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-1">
                                                    <Label className="text-xs text-muted-foreground">Name</Label>
                                                    <Input
                                                        value={table.name}
                                                        onChange={(e) => handleUpdateTableName(index, e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-1">
                                                    <Label className="text-xs text-muted-foreground">Capacity</Label>
                                                    <Input
                                                        type="number"
                                                        value={table.capacity}
                                                        onChange={(e) => handleUpdateTableCapacity(index, parseInt(e.target.value))}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-1">
                                                    <Label className="text-xs text-muted-foreground">Shape</Label>
                                                    <Select
                                                        value={table.position.shape}
                                                        onValueChange={(val: any) => handleUpdateTableShape(index, val)}
                                                    >
                                                        <SelectTrigger className="h-8 text-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="circle">Circle</SelectItem>
                                                            <SelectItem value="square">Square</SelectItem>
                                                            <SelectItem value="rectangle">Rectangle</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                            {generatedTables.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-background">
                                    No tables to create. Go back to generate some.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t bg-background sm:justify-between z-10">
                    {step === "config" ? (
                        <>
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleGenerate} className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Generate Preview
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setStep("config")} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Config
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirm} disabled={isCreating || generatedTables.length === 0 || hasErrors} className="gap-2">
                                    <Check className="w-4 h-4" />
                                    {isCreating ? "Creating..." : `Confirm ${generatedTables.length} Tables`}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
