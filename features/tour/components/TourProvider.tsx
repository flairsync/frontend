import { useEffect } from 'react';
import { useTourStore } from '../tourStore';
import { TourOverlay } from './TourOverlay';
import { TourHelpButton } from './TourHelpButton';

export function TourProvider() {
  const isActive = useTourStore((s) => s.isActive);
  const steps = useTourStore((s) => s.steps);
  const currentIndex = useTourStore((s) => s.currentIndex);
  const setTargetRect = useTourStore((s) => s.setTargetRect);

  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentIndex];
    if (!step) return;

    let attempts = 0;

    const measure = () => {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect());
        }, 350);
      } else if (attempts < 5) {
        attempts++;
        setTimeout(measure, 120);
      }
    };

    measure();
  }, [isActive, currentIndex, steps, setTargetRect]);

  useEffect(() => {
    if (!isActive) return;
    const handleResize = () => {
      const step = steps[currentIndex];
      if (!step) return;
      const el = document.querySelector(step.target);
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, currentIndex, steps, setTargetRect]);

  return (
    <>
      <TourHelpButton />
      <TourOverlay />
    </>
  );
}
