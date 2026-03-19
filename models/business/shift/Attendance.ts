export interface Location {
  lat: number;
  lng: number;
}

export interface AttendanceLog {
  id: string;
  businessId: string;
  employmentId: string;
  shiftId?: string;
  checkInTime: string; // ISO DateTime
  checkOutTime?: string; // ISO DateTime
  checkInLocation?: Location;
  checkOutLocation?: Location;
  breaks: AttendanceBreak[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceBreak {
  id: string;
  startTime: string; // ISO DateTime
  endTime?: string; // ISO DateTime
}
