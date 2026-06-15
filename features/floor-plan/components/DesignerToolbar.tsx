import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DesignerItemType } from "./types";

interface ToolItem {
    type: DesignerItemType;
    subType: string;
    label: string;
    icon: React.ReactNode;
}

const TOOLBAR_ITEMS: { section: string; items: ToolItem[] }[] = [
    {
        section: "Tables",
        items: [
            { type: 'table', subType: 'rectangle', label: 'Rectangle', icon: <rect x="1" y="3" width="22" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /> },
            { type: 'table', subType: 'square', label: 'Square', icon: <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /> },
            { type: 'table', subType: 'circle', label: 'Round', icon: <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /> },
        ],
    },
    {
        section: "Structure",
        items: [
            { type: 'wall', subType: 'default', label: 'Wall', icon: <rect x="2" y="10" width="20" height="4" fill="currentColor" /> },
            { type: 'window', subType: 'default', label: 'Window', icon: <><rect x="2" y="10" width="20" height="4" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" /></> },
            { type: 'door', subType: 'default', label: 'Door', icon: <><rect x="4" y="10" width="12" height="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 10 A8 8 0 0 1 12 10" fill="none" stroke="currentColor" strokeWidth="1.5" /></> },
            { type: 'pillar', subType: 'default', label: 'Pillar', icon: <rect x="8" y="5" width="8" height="14" rx="2" fill="currentColor" opacity="0.7" /> },
        ],
    },
    {
        section: "Decor",
        items: [
            { type: 'plant', subType: 'default', label: 'Plant', icon: <><circle cx="12" cy="12" r="7" fill="#22c55e" opacity="0.8" /><line x1="12" y1="6" x2="12" y2="19" stroke="#15803d" strokeWidth="1.5" /></> },
            { type: 'wc', subType: 'default', label: 'WC', icon: <><rect x="3" y="3" width="18" height="18" rx="3" fill="#3b82f6" opacity="0.8" /><text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">WC</text></> },
            { type: 'bar', subType: 'default', label: 'Bar', icon: <rect x="2" y="8" width="20" height="8" rx="2" fill="#78350f" opacity="0.9" /> },
        ],
    },
    {
        section: "Other",
        items: [
            { type: 'stairs', subType: 'default', label: 'Stairs', icon: <><rect x="2" y="4" width="20" height="16" fill="none" stroke="currentColor" strokeWidth="2" />{[1,2,3].map(i => <line key={i} x1="2" y1={4 + i * 4} x2="22" y2={4 + i * 4} stroke="currentColor" strokeWidth="1" />)}</> },
            { type: 'elevator', subType: 'default', label: 'Lift', icon: <><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><text x="12" y="11" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold">▲</text><text x="12" y="18" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold">▼</text></> },
            { type: 'label', subType: 'default', label: 'Label', icon: <><rect x="2" y="8" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" /><line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5" /></> },
            { type: 'shape', subType: 'default', label: 'Shape', icon: <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4,2" /> },
        ],
    },
];

interface ToolbarProps {
    onAddItem: (type: DesignerItemType, subType: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const DesignerToolbar: React.FC<ToolbarProps> = ({ onAddItem, isCollapsed, onToggleCollapse }) => {
    return (
        <Card className={`border-r shadow-sm transition-all duration-200 shrink-0 flex flex-col ${isCollapsed ? 'w-14' : 'w-48 xl:w-52'}`}>
            <div className="flex items-center justify-end px-2 py-2 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </Button>
            </div>
            <CardContent className={`flex-1 overflow-y-auto p-2 space-y-3 ${isCollapsed ? 'px-1.5' : ''}`}>
                {TOOLBAR_ITEMS.map(({ section, items }) => (
                    <div key={section}>
                        {!isCollapsed && (
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                                {section}
                            </h3>
                        )}
                        {isCollapsed && (
                            <div className="h-px bg-slate-100 my-1" />
                        )}
                        <div className={`flex flex-col gap-1`}>
                            {items.map(item => (
                                <Button
                                    key={`${item.type}-${item.subType}`}
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 text-[10px] font-medium transition-colors hover:bg-slate-50 ${
                                        isCollapsed
                                            ? 'w-full px-0 justify-center'
                                            : 'justify-start gap-2 px-2'
                                    }`}
                                    onClick={() => onAddItem(item.type, item.subType)}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
                                        {item.icon}
                                    </svg>
                                    {!isCollapsed && item.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
