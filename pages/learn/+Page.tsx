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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { TutorialSidebar } from "@/components/learn/TutorialSidebar";
import { TutorialContent } from "@/components/learn/TutorialContent";
import { PART_ICONS, type TFn } from "@/components/learn/constants";

const LandingHeader = clientOnly(() => import("@/components/landing/LandingHeader"));
const WebsiteFooter = clientOnly(() => import("@/components/shared/WebsiteFooter"));

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
