import { BusinessType } from "./BusinessType";
import { BusinessTag } from "./BusinessTag";
import { BusinessMedia } from "./BusinessMedia";

export type Country = {
  id: number;
  name: string;
};

export class OpeningPeriod {
  id: string;
  open: string; // 'HH:MM:SS'
  close: string; // 'HH:MM:SS'

  constructor(id: string, open: string, close: string) {
    this.id = id;
    this.open = open;
    this.close = close;
  }

  toDto() {
    return {
      open: this.open,
      close: this.close,
    };
  }

  static parseApiResponse(data: any): OpeningPeriod | null {
    if (!data) return null;
    try {
      return new OpeningPeriod(data.id, data.open, data.close);
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): OpeningPeriod[] {
    const arr: OpeningPeriod[] = [];
    data.forEach((val) => {
      const period = this.parseApiResponse(val);
      if (period) arr.push(period);
    });
    return arr;
  }
}

export class OpeningHours {
  id: string;
  day: string;
  isClosed: boolean;
  periods: OpeningPeriod[];

  constructor(
    id: string,
    day: string,
    isClosed: boolean,
    periods: OpeningPeriod[]
  ) {
    this.id = id;
    this.day = day;
    this.isClosed = isClosed;
    this.periods = periods;
  }

  static parseApiResponse(data: any): OpeningHours | null {
    if (!data) return null;
    try {
      const periods = OpeningPeriod.parseApiArrayResponse(data.periods || []);
      return new OpeningHours(data.id, data.day, data.isClosed, periods);
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): OpeningHours[] {
    const arr: OpeningHours[] = [];
    data.forEach((val) => {
      const oh = this.parseApiResponse(val);
      if (oh) arr.push(oh);
    });
    return arr;
  }

  toUpdateDto() {
    return {
      day: this.day,
      isClosed: this.isClosed,
      periods: this.isClosed ? [] : this.periods.map((p) => p.toDto()),
    };
  }

  static toUpdateDtoArray(hours: OpeningHours[]) {
    return {
      openingHours: hours.map((h) => h.toUpdateDto()),
    };
  }
}

export class MyBusinessFullDetails {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  priceLevel: number;
  country: Country | null;
  countryId: number;
  type: BusinessType | null;
  typeId: number;
  tags: BusinessTag[];
  city?: string;
  state?: string;
  address?: string;
  location?: { type: string; coordinates: number[] };
  timezone: string;
  currency?: string;
  openingHours: OpeningHours[];
  status: string;
  media: BusinessMedia[];
  facebook?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  logo?: string;
  allowReservations: boolean;
  allowOrders: boolean;
  requireReservationConfirmation: boolean;
  requireOrderConfirmation: boolean;
  allowOnlyNearbyOrders: boolean;
  maxOrderDistanceMeters: number;
  allowTableOrdering: boolean;
  allowTakeawayOrdering: boolean;
  reservationCancellationWindow: number;
  reservationModificationLimit: number;
  reservationTimeoutMinutes: number;
  defaultReservationDurationMinutes: number;
  requireGpsForAttendance: boolean;
  attendanceGeofenceRadiusMeters: number;
  strictGeofenceBlock: boolean;
  counts?: {
    employees: number;
    menus: number;
  };
  maxWeeklyHours?: number;
  minGapBetweenShiftsHours?: number;
  splitShiftGapHours?: number;
  maxPartySize: number;
  reservationBookingWindowDays: number;
  reservationBufferMinutes: number;
  autoNoShow: boolean;
  gracePeriodMinutes: number;

  constructor(
    id: string,
    name: string,
    description: string | undefined,
    creatorId: string,
    priceLevel: number,
    country: Country | null,
    countryId: number,
    type: BusinessType | null,
    typeId: number,
    tags: BusinessTag[],
    city: string | undefined,
    state: string | undefined,
    address: string | undefined,
    location: { type: string; coordinates: number[] } | undefined,
    timezone: string,
    currency: string | undefined,
    openingHours: OpeningHours[],
    status: string,
    media: BusinessMedia[],
    facebook: string | undefined,
    instagram: string | undefined,
    email: string | undefined,
    phone: string | undefined,
    logo: string | undefined,
    allowReservations: boolean,
    allowOrders: boolean,
    requireReservationConfirmation: boolean,
    requireOrderConfirmation: boolean,
    allowOnlyNearbyOrders: boolean,
    maxOrderDistanceMeters: number,
    allowTableOrdering: boolean,
    allowTakeawayOrdering: boolean,
    reservationCancellationWindow: number,
    reservationModificationLimit: number,
    reservationTimeoutMinutes: number,
    defaultReservationDurationMinutes: number,
    requireGpsForAttendance: boolean,
    attendanceGeofenceRadiusMeters: number,
    strictGeofenceBlock: boolean,
    createdAt: Date,
    updatedAt: Date,
    counts?: {
      employees: number;
      menus: number;
    },
    maxWeeklyHours?: number,
    minGapBetweenShiftsHours?: number,
    splitShiftGapHours?: number,
    maxPartySize?: number,
    reservationBookingWindowDays?: number,
    reservationBufferMinutes?: number,
    autoNoShow?: boolean,
    gracePeriodMinutes?: number,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.creatorId = creatorId;
    this.priceLevel = priceLevel;
    this.country = country;
    this.countryId = countryId;
    this.type = type;
    this.typeId = typeId;
    this.tags = tags;
    this.city = city;
    this.state = state;
    this.address = address;
    this.location = location;
    this.timezone = timezone;
    this.currency = currency;
    this.openingHours = openingHours;
    this.status = status;
    this.media = media;
    this.facebook = facebook;
    this.instagram = instagram;
    this.email = email;
    this.phone = phone;
    this.logo = logo;
    this.allowReservations = allowReservations;
    this.allowOrders = allowOrders;
    this.requireReservationConfirmation = requireReservationConfirmation;
    this.requireOrderConfirmation = requireOrderConfirmation;
    this.allowOnlyNearbyOrders = allowOnlyNearbyOrders;
    this.maxOrderDistanceMeters = maxOrderDistanceMeters;
    this.allowTableOrdering = allowTableOrdering;
    this.allowTakeawayOrdering = allowTakeawayOrdering;
    this.reservationCancellationWindow = reservationCancellationWindow;
    this.reservationModificationLimit = reservationModificationLimit;
    this.reservationTimeoutMinutes = reservationTimeoutMinutes;
    this.defaultReservationDurationMinutes = defaultReservationDurationMinutes;
    this.requireGpsForAttendance = requireGpsForAttendance;
    this.attendanceGeofenceRadiusMeters = attendanceGeofenceRadiusMeters;
    this.strictGeofenceBlock = strictGeofenceBlock;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.counts = counts;
    this.maxWeeklyHours = maxWeeklyHours;
    this.minGapBetweenShiftsHours = minGapBetweenShiftsHours;
    this.splitShiftGapHours = splitShiftGapHours;
    this.maxPartySize = maxPartySize ?? 20;
    this.reservationBookingWindowDays = reservationBookingWindowDays ?? 60;
    this.reservationBufferMinutes = reservationBufferMinutes ?? 0;
    this.autoNoShow = autoNoShow ?? false;
    this.gracePeriodMinutes = gracePeriodMinutes ?? 30;
  }

  static parseApiResponse(data: any): MyBusinessFullDetails | null {
    if (!data) return null;
    try {
      return new MyBusinessFullDetails(
        data.id,
        data.name,
        data.description,
        data.creatorId,
        data.priceLevel,
        data.country,
        data.countryId,
        BusinessType.parseApiResponse(data.type),
        data.typeId,
        BusinessTag.parseApiArrayResponse(data.tags || []),
        data.city,
        data.state,
        data.address,
        data.location,
        data.timezone || "UTC",
        data.currency,
        OpeningHours.parseApiArrayResponse(data.openingHours || []),
        data.status,
        BusinessMedia.parseApiArrayResponse(data.media),
        data.facebook,
        data.instagram,
        data.email,
        data.phone,
        data.logo,
        !!data.allowReservations,
        !!data.allowOrders,
        !!data.requireReservationConfirmation,
        !!data.requireOrderConfirmation,
        !!data.allowOnlyNearbyOrders,
        data.maxOrderDistanceMeters !== undefined && data.maxOrderDistanceMeters !== null ? Number(data.maxOrderDistanceMeters) : 500,
        data.allowTableOrdering !== undefined ? !!data.allowTableOrdering : true,
        data.allowTakeawayOrdering !== undefined ? !!data.allowTakeawayOrdering : true,
        data.reservationCancellationWindow !== undefined ? Number(data.reservationCancellationWindow) : 1,
        data.reservationModificationLimit !== undefined ? Number(data.reservationModificationLimit) : 120,
        data.reservationTimeoutMinutes !== undefined ? Number(data.reservationTimeoutMinutes) : 15,
        data.defaultReservationDurationMinutes !== undefined ? Number(data.defaultReservationDurationMinutes) : 120,
        !!data.requireGpsForAttendance,
        data.attendanceGeofenceRadiusMeters !== undefined ? Number(data.attendanceGeofenceRadiusMeters) : 50,
        !!data.strictGeofenceBlock,
        new Date(data.createdAt),
        new Date(data.updatedAt),
        data.counts,
        data.maxWeeklyHours !== undefined && data.maxWeeklyHours !== null ? Number(data.maxWeeklyHours) : undefined,
        data.minGapBetweenShiftsHours !== undefined && data.minGapBetweenShiftsHours !== null ? Number(data.minGapBetweenShiftsHours) : undefined,
        data.splitShiftGapHours !== undefined && data.splitShiftGapHours !== null ? Number(data.splitShiftGapHours) : undefined,
        data.maxPartySize !== undefined ? Number(data.maxPartySize) : 20,
        data.reservationBookingWindowDays !== undefined ? Number(data.reservationBookingWindowDays) : 60,
        data.reservationBufferMinutes !== undefined ? Number(data.reservationBufferMinutes) : 0,
        data.autoNoShow !== undefined ? !!data.autoNoShow : false,
        data.gracePeriodMinutes !== undefined ? Number(data.gracePeriodMinutes) : 30,
      );
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): MyBusinessFullDetails[] {
    const arr: MyBusinessFullDetails[] = [];
    data.forEach((val) => {
      const business = this.parseApiResponse(val);
      if (business) arr.push(business);
    });
    return arr;
  }
}

// OPS types

export type UpdateBusinessDetailsDto = {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  facebook?: string;
  instagram?: string;
  priceLevel?: number;
  status?: string;
  timezone?: string;
  currency?: string;
  allowReservations?: boolean;
  allowOrders?: boolean;
  requireReservationConfirmation?: boolean;
  requireOrderConfirmation?: boolean;
  allowOnlyNearbyOrders?: boolean;
  maxOrderDistanceMeters?: number;
  allowTableOrdering?: boolean;
  allowTakeawayOrdering?: boolean;
  reservationCancellationWindow?: number;
  reservationModificationLimit?: number;
  reservationTimeoutMinutes?: number;
  defaultReservationDurationMinutes?: number;
  requireGpsForAttendance?: boolean;
  attendanceGeofenceRadiusMeters?: number;
  strictGeofenceBlock?: boolean;
  countryId?: number;
  location?: { type: "Point"; coordinates: [number, number] };
  maxWeeklyHours?: number;
  minGapBetweenShiftsHours?: number;
  splitShiftGapHours?: number;
  maxPartySize?: number;
  reservationBookingWindowDays?: number;
  reservationBufferMinutes?: number;
  autoNoShow?: boolean;
  gracePeriodMinutes?: number;
};
