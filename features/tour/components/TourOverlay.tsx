import { motion, AnimatePresence } from 'framer-motion';
import { useTourStore } from '../tourStore';
import { TourTooltip } from './TourTooltip';

const DEFAULT_PADDING = 8;

export function TourOverlay() {
  const isActive = useTourStore((s) => s.isActive);
  const targetRect = useTourStore((s) => s.targetRect);
  const steps = useTourStore((s) => s.steps);
  const currentIndex = useTourStore((s) => s.currentIndex);
  const endTour = useTourStore((s) => s.endTour);

  const step = steps[currentIndex];
  const padding = step?.padding ?? DEFAULT_PADDING;

  const rx = (targetRect?.x ?? -40) - padding;
  const ry = (targetRect?.y ?? -40) - padding;
  const rw = (targetRect?.width ?? 0) + padding * 2;
  const rh = (targetRect?.height ?? 0) + padding * 2;
  const hasTarget = !!targetRect;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Click-blocker — blocks all background interaction */}
          <motion.div
            className="fixed inset-0 z-[9998] cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={endTour}
          />

          {/* Spotlight — box-shadow creates the dark overlay with a transparent cutout */}
          <motion.div
            className="fixed rounded-lg pointer-events-none z-[9999]"
            style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)' }}
            initial={{ opacity: 0, left: -40, top: -40, width: 0, height: 0 }}
            animate={{
              left: rx,
              top: ry,
              width: rw,
              height: rh,
              opacity: hasTarget ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          />

          {/* Highlight ring — colored border around the target */}
          <motion.div
            className="fixed rounded-lg pointer-events-none z-[10000] ring-2 ring-primary/70"
            initial={{ opacity: 0, left: -40, top: -40, width: 0, height: 0 }}
            animate={{
              left: rx,
              top: ry,
              width: rw,
              height: rh,
              opacity: hasTarget ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          />

          {/* Tooltip card */}
          <TourTooltip />
        </>
      )}
    </AnimatePresence>
  );
}
