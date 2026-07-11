import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPONENT_REGISTRY, CATEGORY_META } from "../registry";

interface ComponentPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (typeKey: string) => void;
}

const ComponentPickerModal: React.FC<ComponentPickerModalProps> = ({ open, onOpenChange, onSelect }) => {
    const entries = Object.entries(COMPONENT_REGISTRY).filter(
        ([key, entry]) => key !== "fallback@1" && !entry.deprecated && entry.label && entry.category
    );

    const categories = Object.keys(CATEGORY_META).filter((category) => entries.some(([, entry]) => entry.category === category));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add a Component</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue={categories[0]}>
                    <TabsList className="flex-wrap h-auto">
                        {categories.map((category) => {
                            const Icon = CATEGORY_META[category].icon;
                            return (
                                <TabsTrigger key={category} value={category} className="gap-1.5">
                                    <Icon className="w-4 h-4" /> {CATEGORY_META[category].label}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                    {categories.map((category) => (
                        <TabsContent key={category} value={category}>
                            <ScrollArea className="max-h-[360px]">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                                    {entries
                                        .filter(([, entry]) => entry.category === category)
                                        .map(([typeKey, entry]) => {
                                            const Icon = CATEGORY_META[category].icon;
                                            return (
                                                <button
                                                    key={typeKey}
                                                    onClick={() => onSelect(typeKey)}
                                                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                                >
                                                    <Icon className="w-6 h-6 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{entry.label}</span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default ComponentPickerModal;
