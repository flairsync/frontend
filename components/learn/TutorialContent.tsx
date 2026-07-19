import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Lightbulb,
  User,
  ChevronLeft,
} from "lucide-react";
import {
  findPartForSection,
  type TutorialSection,
  type TutorialPart,
} from "@/components/tutorials/data";
import type { TFn } from "@/components/learn/constants";

interface StepGroup {
  label?: string;
  steps: string[];
}

// ─── Tutorial content ─────────────────────────────────────────────────────────

export function TutorialContent({
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
