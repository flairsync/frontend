export interface StaffAvailability {
  id: string;
  employmentId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isAvailable: boolean;
}

export interface AvailabilityProfile {
  employmentId: string;
  availability: StaffAvailability[];
}
