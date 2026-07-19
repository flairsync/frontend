import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BookOpen, Search } from "lucide-react";
import {
  TUTORIAL_PARTS,
  findPartForSection,
  getAllSections,
  type TutorialSection,
  type TutorialPart,
} from "@/components/tutorials/data";
import { PART_ICONS, type TFn } from "@/components/learn/constants";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function TutorialSidebar({
  activeSectionId,
  openParts,
  onOpenPartsChange,
  onSelectSection,
  searchQuery,
  onSearchChange,
  t,
}: {
  activeSectionId: string | null;
  openParts: string[];
  onOpenPartsChange: (v: string[]) => void;
  onSelectSection: (section: TutorialSection, part: TutorialPart) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  t: TFn;
}) {
  const filtered = searchQuery.trim()
    ? getAllSections().filter(
        (s) =>
          t(`sections.${s.slug}.title`).toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.includes(searchQuery)
      )
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm">FlairSync Guide</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={t("ui.search_placeholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1">
        <div className="px-2 pt-3 pb-8">
          {filtered ? (
            // Search results
            filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center">{t("ui.no_results")}</p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((section) => {
                  const part = findPartForSection(section.id)!;
                  const Icon = PART_ICONS[part.number] ?? BookOpen;
                  return (
                    <SidebarItem
                      key={section.id}
                      section={section}
                      active={activeSectionId === section.id}
                      icon={<Icon className="w-3 h-3 shrink-0 text-muted-foreground" />}
                      onSelect={() => onSelectSection(section, part)}
                      t={t}
                    />
                  );
                })}
              </div>
            )
          ) : (
            // Full tree
            <Accordion
              type="multiple"
              value={openParts}
              onValueChange={onOpenPartsChange}
              className="space-y-0.5"
            >
              {TUTORIAL_PARTS.map((part) => {
                const Icon = PART_ICONS[part.number] ?? BookOpen;
                return (
                  <AccordionItem
                    key={part.number}
                    value={String(part.number)}
                    className="border-0"
                  >
                    <AccordionTrigger className="px-2 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:no-underline rounded-md hover:bg-muted/50 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:shrink-0">
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate text-left">
                          {part.number}. {t(`parts.${part.number}`)}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-0.5 pl-2">
                      <div className="space-y-0.5 border-l border-border/60 pl-3 ml-1">
                        {part.sections.map((section) => (
                          <SidebarItem
                            key={section.id}
                            section={section}
                            active={activeSectionId === section.id}
                            onSelect={() => onSelectSection(section, part)}
                            t={t}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function SidebarItem({
  section,
  active,
  onSelect,
  icon,
  t,
}: {
  section: TutorialSection;
  active: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  t: TFn;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors group flex items-start gap-1.5",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {icon && <span className="mt-0.5">{icon}</span>}
      <span className="leading-snug">
        <span className="opacity-50 mr-1">{section.id}</span>
        {t(`sections.${section.slug}.title`)}
      </span>
    </button>
  );
}
