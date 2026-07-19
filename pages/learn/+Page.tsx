"use client";

import React, { useState, useEffect, useRef } from "react";
import { clientOnly } from "vike-react/clientOnly";
import { useTranslation } from "react-i18next";
import {
  TUTORIAL_PARTS,
  findSectionBySlug,
  findPartForSection,
  getAllSections,
  type TutorialSection,
  type TutorialPart,
} from "@/components/tutorials/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Lightbulb,
  User,
  Search,
  LogIn,
  Shield,
  Store,
  Users,
  Calendar,
  Clock,
  UtensilsCrossed,
  LayoutGrid,
  ShoppingBag,
  Monitor,
  CalendarCheck,
  Package,
  Bell,
  BarChart3,
  Tablet,
  Compass,
  CreditCard,
  ClipboardList,
  Briefcase,
  ShoppingCart,
  HelpCircle,
  Lock,
  ChevronLeft,
} from "lucide-react";

const LandingHeader = clientOnly(() => import("@/components/landing/LandingHeader"));
const WebsiteFooter = clientOnly(() => import("@/components/shared/WebsiteFooter"));

const PART_ICONS: Record<number, React.ElementType> = {
  1: LogIn,
  2: Store,
  3: Users,
  4: Calendar,
  5: Clock,
  6: UtensilsCrossed,
  7: LayoutGrid,
  8: ShoppingBag,
  9: Monitor,
  10: CalendarCheck,
  11: Package,
  12: Bell,
  13: BarChart3,
  14: Tablet,
  15: Compass,
  16: CreditCard,
  17: ClipboardList,
  18: Briefcase,
  19: ShoppingCart,
  20: HelpCircle,
  21: Lock,
};

type TFn = ReturnType<typeof useTranslation<"tutorials">>["t"];

interface StepGroup {
  label?: string;
  steps: string[];
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function TutorialSidebar({
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

// ─── Overview landing card grid ───────────────────────────────────────────────

function OverviewGrid({
  onSelectSection,
  t,
}: {
  onSelectSection: (section: TutorialSection, part: TutorialPart) => void;
  t: TFn;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">{t("page.title")}</h1>
        </div>
        <p className="text-muted-foreground text-base max-w-xl">{t("page.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TUTORIAL_PARTS.map((part) => {
          const Icon = PART_ICONS[part.number] ?? BookOpen;
          const first = part.sections[0];
          const count = part.sections.length;
          return (
            <button
              key={part.number}
              onClick={() => onSelectSection(first, part)}
              className="group text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("ui.part")} {part.number}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                      {count} {count === 1 ? t("ui.topic") : t("ui.topics")}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm mt-0.5">{t(`parts.${part.number}`)}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {part.sections.map((s) => t(`sections.${s.slug}.title`)).join(" · ")}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tutorial content ─────────────────────────────────────────────────────────

function TutorialContent({
  section,
  part,
  allSections,
  onNavigate,
  t,
}: {
  section: TutorialSection;
  part: TutorialPart;
  allSections: TutorialSection[];
  onNavigate: (s: TutorialSection, p: TutorialPart) => void;
  t: TFn;
}) {
  const currentIdx = allSections.findIndex((s) => s.id === section.id);
  const prev = currentIdx > 0 ? allSections[currentIdx - 1] : null;
  const next = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null;

  const prevPart = prev ? findPartForSection(prev.id) : null;
  const nextPart = next ? findPartForSection(next.id) : null;

  const slug = section.slug;
  const stepGroups = t(`sections.${slug}.stepGroups`, { returnObjects: true }) as StepGroup[];
  const tips = t(`sections.${slug}.tips`, { returnObjects: true });
  const tipsArray = Array.isArray(tips) ? (tips as string[]) : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{t("ui.part")} {part.number}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{t(`sections.${slug}.title`)}</span>
      </nav>

      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs font-mono">
            {section.id}
          </Badge>
          <span className="text-xs text-muted-foreground">— {t(`parts.${part.number}`)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
          {t(`sections.${slug}.title`)}
        </h1>
      </div>

      {/* What it is */}
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("ui.overview_label")}</p>
        <p className="text-sm leading-relaxed">{t(`sections.${slug}.whatItIs`)}</p>
      </div>

      {/* Who uses it */}
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3 h-3 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">{t("ui.who_uses")}</p>
          <p className="text-sm text-foreground">{t(`sections.${slug}.whoUsesIt`)}</p>
        </div>
      </div>

      <Separator />

      {/* Steps */}
      <div className="space-y-6">
        <h2 className="text-base font-bold">{t("ui.how_to")}</h2>
        {Array.isArray(stepGroups) && stepGroups.map((group, gi) => (
          <div key={gi} className="space-y-3">
            {group.label && (
              <p className="text-sm font-semibold text-primary/80 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" />
                {group.label}
              </p>
            )}
            <ol className="space-y-2.5">
              {Array.isArray(group.steps) && group.steps.map((step, si) => (
                <li key={si} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {si + 1}
                  </span>
                  <span className="text-foreground/90 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Tips */}
      {tipsArray.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-5 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">{t("ui.tips_label")}</p>
          </div>
          <ul className="space-y-1.5">
            {tipsArray.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300">
                <span className="text-amber-400 mt-1 shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prev / Next */}
      <Separator />
      <div className="flex items-center justify-between gap-4">
        {prev && prevPart ? (
          <button
            onClick={() => onNavigate(prev, prevPart)}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
          >
            <ChevronLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <div>
              <p className="text-xs uppercase tracking-wider">{t("ui.prev_label")}</p>
              <p className="font-medium truncate max-w-[180px]">{t(`sections.${prev.slug}.title`)}</p>
            </div>
          </button>
        ) : (
          <span />
        )}
        {next && nextPart ? (
          <button
            onClick={() => onNavigate(next, nextPart)}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right ml-auto"
          >
            <div>
              <p className="text-xs uppercase tracking-wider">{t("ui.next_label")}</p>
              <p className="font-medium truncate max-w-[180px]">{t(`sections.${next.slug}.title`)}</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const LearnPage: React.FC = () => {
  const { t } = useTranslation("tutorials");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [openParts, setOpenParts] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);

  const allSections = getAllSections();

  // Sync with URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const section = findSectionBySlug(hash);
      if (section) {
        const part = findPartForSection(section.id);
        activateSection(section, part ?? null, false);
        return;
      }
    }
  }, []);

  const activateSection = (
    section: TutorialSection,
    part: TutorialPart | null,
    scroll = true
  ) => {
    setActiveSectionId(section.id);
    if (part) {
      setOpenParts((prev) =>
        prev.includes(String(part.number)) ? prev : [...prev, String(part.number)]
      );
    }
    window.history.replaceState(null, "", `/learn#${section.slug}`);
    setSidebarOpen(false);
    if (scroll && mainRef.current) {
      mainRef.current.scrollTo({ top: 0 });
    }
  };

  const handleSelectSection = (section: TutorialSection, part: TutorialPart) => {
    activateSection(section, part);
  };

  const activeSection = activeSectionId
    ? allSections.find((s) => s.id === activeSectionId) ?? null
    : null;
  const activePart = activeSectionId ? findPartForSection(activeSectionId) ?? null : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />

      {/* Layout: sidebar + main */}
      <div className="flex flex-1 mt-20" style={{ height: "calc(100vh - 80px)" }}>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border overflow-hidden sticky top-20 h-[calc(100vh-80px)]">
          <TutorialSidebar
            activeSectionId={activeSectionId}
            openParts={openParts}
            onOpenPartsChange={setOpenParts}
            onSelectSection={handleSelectSection}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            t={t}
          />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <span className="font-semibold text-sm">FlairSync Guide</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <TutorialSidebar
                activeSectionId={activeSectionId}
                openParts={openParts}
                onOpenPartsChange={setOpenParts}
                onSelectSection={handleSelectSection}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                t={t}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {/* Mobile top bar */}
          <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>{t("ui.contents")}</span>
            </button>
            {activeSection && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{t(`sections.${activeSection.slug}.title`)}</span>
              </>
            )}
          </div>

          {activeSection && activePart ? (
            <TutorialContent
              section={activeSection}
              part={activePart}
              allSections={allSections}
              onNavigate={handleSelectSection}
              t={t}
            />
          ) : (
            <OverviewGrid onSelectSection={handleSelectSection} t={t} />
          )}

          {/* Footer */}
          <WebsiteFooter />
        </main>
      </div>
    </div>
  );
};

export default LearnPage;
