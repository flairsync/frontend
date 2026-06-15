import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTourStore } from '../tourStore';
import type { TourStepPosition } from '../types';

const CARD_WIDTH = 300;
const CARD_HEIGHT_EST = 260;
const OFFSET = 16;
const PAD = 10;

function computePosition(
  rect: DOMRect,
  preferred: TourStepPosition,
  vw: number,
  vh: number
): { x: number; y: number } {
  const all: Exclude<TourStepPosition, 'auto'>[] = ['bottom', 'top', 'right', 'left'];
  const candidates =
    preferred === 'auto' ? all : [preferred, ...all.filter((p) => p !== preferred)];

  for (const pos of candidates) {
    if (pos === 'bottom') {
      const x = clamp(rect.left + rect.width / 2 - CARD_WIDTH / 2, PAD, vw - CARD_WIDTH - PAD);
      const y = rect.bottom + OFFSET;
      if (y + CARD_HEIGHT_EST < vh - PAD) return { x, y };
    }
    if (pos === 'top') {
      const x = clamp(rect.left + rect.width / 2 - CARD_WIDTH / 2, PAD, vw - CARD_WIDTH - PAD);
      const y = rect.top - CARD_HEIGHT_EST - OFFSET;
      if (y > PAD) return { x, y };
    }
    if (pos === 'right') {
      const x = rect.right + OFFSET;
      const y = clamp(rect.top + rect.height / 2 - CARD_HEIGHT_EST / 2, PAD, vh - CARD_HEIGHT_EST - PAD);
      if (x + CARD_WIDTH < vw - PAD) return { x, y };
    }
    if (pos === 'left') {
      const x = rect.left - CARD_WIDTH - OFFSET;
      const y = clamp(rect.top + rect.height / 2 - CARD_HEIGHT_EST / 2, PAD, vh - CARD_HEIGHT_EST - PAD);
      if (x > PAD) return { x, y };
    }
  }

  // Final fallback: clamp above the element, never off-screen
  return {
    x: clamp(rect.left + rect.width / 2 - CARD_WIDTH / 2, PAD, vw - CARD_WIDTH - PAD),
    y: clamp(rect.top - CARD_HEIGHT_EST - OFFSET, PAD, vh - CARD_HEIGHT_EST - PAD),
  };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(val, max));
}

export function TourTooltip() {
  const steps = useTourStore((s) => s.steps);
  const currentIndex = useTourStore((s) => s.currentIndex);
  const targetRect = useTourStore((s) => s.targetRect);
  const next = useTourStore((s) => s.next);
  const prev = useTourStore((s) => s.prev);
  const endTour = useTourStore((s) => s.endTour);

  const step = steps[currentIndex];
  if (!step || !targetRect) return null;

  const { x, y } = computePosition(targetRect, step.position ?? 'auto', window.innerWidth, window.innerHeight);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    <motion.div
      style={{ position: 'fixed', left: 0, top: 0, width: CARD_WIDTH, zIndex: 10001 }}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="bg-background border rounded-xl shadow-2xl pointer-events-auto"
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Step {currentIndex + 1} of {steps.length}
            </p>
            <h3 className="text-sm font-semibold mt-0.5 leading-snug">{step.title}</h3>
          </div>
          <button
            onClick={endTour}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
            aria-label="Close tour"
          >
            <X size={15} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-4 bg-primary'
                  : i < currentIndex
                  ? 'w-1.5 bg-primary/40'
                  : 'w-1.5 bg-muted-foreground/25'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button variant="outline" size="sm" onClick={prev} className="gap-1 h-8">
              <ChevronLeft size={13} />
              Back
            </Button>
          )}
          <Button size="sm" onClick={next} className="ml-auto gap-1 h-8">
            {isLast ? 'Finish' : 'Next'}
            {!isLast && <ChevronRight size={13} />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
