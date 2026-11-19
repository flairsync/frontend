import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTourStore } from '../tourStore';

export function TourHelpButton() {
  const { t } = useTranslation();
  const registeredSteps = useTourStore((s) => s.registeredSteps);
  const isActive = useTourStore((s) => s.isActive);
  const startTour = useTourStore((s) => s.startTour);
  const endTour = useTourStore((s) => s.endTour);

  const hasSteps = !!registeredSteps?.length;

  // P1-26 (QA, 2026-11-18): this floats bottom-right on every page with a tour, which on a
  // short page (e.g. Staff → Invitations) can sit directly over pagination controls that
  // also live in that corner. Dismissing hides it for this page view; it reappears on the
  // next page that registers steps, rather than needing a persisted preference for something
  // this low-stakes.
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(false);
  }, [registeredSteps]);

  const handleClick = () => {
    if (isActive) {
      endTour();
    } else if (registeredSteps) {
      startTour(registeredSteps);
    }
  };

  return (
    <AnimatePresence>
      {hasSteps && !dismissed && (
        <motion.div
          // Several pages (e.g. the Rota) put their primary action — Publish,
          // Save — in that same bottom-right corner, either in-flow near the
          // page's end or in their own sticky footer. bottom-24 floats this
          // well clear of both, instead of sitting on top of them.
          className="fixed bottom-24 right-6 z-[9990] flex items-center group"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          {/* Idle pulse ring — only shows when tour is not active */}
          {!isActive && (
            <span className="absolute inset-0 rounded-full bg-primary/25 group-hover:animate-ping pointer-events-none" />
          )}

          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex items-center gap-2 rounded-full shadow-lg px-4 py-2.5
              text-sm font-medium transition-colors duration-200
              ring-1 ring-white/10
              ${isActive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
            <motion.span
              key={isActive ? 'active' : 'idle'}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              {isActive ? <X size={15} /> : <Compass size={15} />}
            </motion.span>

            <AnimatePresence mode="wait">
              <motion.span
                key={isActive ? 'end' : 'start'}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {isActive ? t('tour_help_button.end') : t('tour_help_button.start')}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {!isActive && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label={t('tour_help_button.dismiss')}
              className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground shadow ring-1 ring-border hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={11} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
