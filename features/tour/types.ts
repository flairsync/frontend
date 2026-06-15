export type TourStepPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: TourStepPosition;
  padding?: number;
}
