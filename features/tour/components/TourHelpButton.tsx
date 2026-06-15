import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { useTourStore } from '../tourStore';

export function TourHelpButton() {
  const registeredSteps = useTourStore((s) => s.registeredSteps);
  const isActive = useTourStore((s) => s.isActive);
  const startTour = useTourStore((s) => s.startTour);
  const endTour = useTourStore((s) => s.endTour);

  const hasSteps = !!registeredSteps?.length;

  const handleClick = () => {
    if (isActive) {
      endTour();
    } else if (registeredSteps) {
      startTour(registeredSteps);
    }
  };

  return (
    <AnimatePresence>
      {hasSteps && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9990] flex items-center group"
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
                {isActive ? 'End Tour' : 'Page Tour'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
