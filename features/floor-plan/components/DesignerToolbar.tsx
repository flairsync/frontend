import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Grid2X2, Square, HandHelping, Info, LogOut, Coffee, TreePine } from "lucide-react";
import { DesignerItemType } from "./types";

interface ToolbarProps {
    onAddItem: (type: DesignerItemType, subType: string) => void;
}

export const DesignerToolbar: React.FC<ToolbarProps> = ({ onAddItem }) => {
    return (
        <Card className="w-64 border-r">
            <CardContent className="p-4 space-y-6">
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tables</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('table', 'square')}>
                            <Square className="w-4 h-4" />
                            Square
                        </Button>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('table', 'circle')}>
                            <div className="w-4 h-4 rounded-full border-2 border-current" />
                            Circle
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Architectural</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('wall', 'solid')}>
                            <div className="w-4 h-1 bg-current" />
                            Wall
                        </Button>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('window', 'glass')}>
                            <div className="w-4 h-1 border border-current opacity-50" />
                            Window
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decor & Signs</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('object', 'plant')}>
                            <TreePine className="w-4 h-4" />
                            Plant
                        </Button>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('sign', 'wc')}>
                            <HandHelping className="w-4 h-4" />
                            WC
                        </Button>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 text-[10px]" onClick={() => onAddItem('sign', 'exit')}>
                            <LogOut className="w-4 h-4" />
                            Exit
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
