import React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LINK_PRESET_OPTIONS, isSectionLink, sectionIdFromLink, sectionLinkValue } from "../linkPresets";
import { SiteSection, NavLinkItem } from "../types";

interface NavLinksEditorProps {
    value: NavLinkItem[];
    onChange: (links: NavLinkItem[]) => void;
    sections: SiteSection[];
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`);

type HrefKind = "reservations" | "menu" | "section" | "custom";

const kindOf = (href: string): HrefKind => {
    if (href === "reservations" || href === "menu") return href;
    if (isSectionLink(href)) return "section";
    return "custom";
};

const NavLinksEditor: React.FC<NavLinksEditorProps> = ({ value, onChange, sections }) => {
    const links = value || [];

    const updateLink = (id: string, patch: Partial<NavLinkItem>) => {
        onChange(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    };

    const removeLink = (id: string) => {
        onChange(links.filter((l) => l.id !== id));
    };

    const addLink = () => {
        onChange([...links, { id: newId(), text: "", href: "menu" }]);
    };

    return (
        <div className="space-y-3">
            {links.map((link, i) => {
                const kind = kindOf(link.href);
                return (
                    <div key={link.id} className="space-y-2 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                            <Input
                                value={link.text}
                                onChange={(e) => updateLink(link.id, { text: e.target.value })}
                                placeholder={`Link ${i + 1} text`}
                                className="h-8 text-sm"
                            />
                            <button
                                onClick={() => removeLink(link.id)}
                                className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <Select
                            value={kind}
                            onValueChange={(v) => {
                                if (v === "reservations" || v === "menu") updateLink(link.id, { href: v });
                                else if (v === "section") updateLink(link.id, { href: sections[0] ? sectionLinkValue(sections[0].id) : "" });
                                else updateLink(link.id, { href: "" });
                            }}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LINK_PRESET_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                                <SelectItem value="section">Jump to Section</SelectItem>
                                <SelectItem value="custom">Custom URL</SelectItem>
                            </SelectContent>
                        </Select>

                        {kind === "section" && (
                            <Select
                                value={isSectionLink(link.href) ? sectionIdFromLink(link.href) : ""}
                                onValueChange={(sectionId) => updateLink(link.id, { href: sectionLinkValue(sectionId) })}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s, idx) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name || `Section ${idx + 1}`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {kind === "custom" && (
                            <Input
                                value={link.href}
                                onChange={(e) => updateLink(link.id, { href: e.target.value })}
                                placeholder="https://"
                                className="h-8 text-sm"
                            />
                        )}
                    </div>
                );
            })}
            <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" onClick={addLink}>
                <Plus className="w-3.5 h-3.5" /> Add Link
            </Button>
        </div>
    );
};

export default NavLinksEditor;
