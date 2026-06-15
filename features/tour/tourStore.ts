import { create } from 'zustand';
import type { TourStep } from './types';

interface TourState {
  isActive: boolean;
  steps: TourStep[];
  currentIndex: number;
  targetRect: DOMRect | null;
  registeredSteps: TourStep[] | null;

  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  next: () => void;
  prev: () => void;
  setTargetRect: (rect: DOMRect | null) => void;
  registerPageTour: (steps: TourStep[]) => void;
  unregisterPageTour: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  steps: [],
  currentIndex: 0,
  targetRect: null,
  registeredSteps: null,

  startTour: (steps) =>
    set({ isActive: true, steps, currentIndex: 0, targetRect: null }),

  endTour: () =>
    set({ isActive: false, steps: [], currentIndex: 0, targetRect: null }),

  next: () => {
    const { currentIndex, steps, endTour } = get();
    if (currentIndex < steps.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      endTour();
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  setTargetRect: (rect) => set({ targetRect: rect }),

  registerPageTour: (steps) => set({ registeredSteps: steps }),

  unregisterPageTour: () => set({ registeredSteps: null }),
}));
