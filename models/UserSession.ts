import dayjs from "dayjs";

export class UserSession {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  deviceName?: string;
  location?: string;
  active: boolean;
  trustedDevice: boolean;
  version: number;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    deviceFingerprint: string | undefined,
    deviceName: string | undefined,
    location: string | undefined,
    active: boolean,
    trustedDevice: boolean,
    version: number,
    expiresAt: Date,
    isRevoked: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.deviceFingerprint = deviceFingerprint;
    this.deviceName = deviceName;
    this.location = location;
    this.active = active;
    this.trustedDevice = trustedDevice;
    this.version = version;
    this.expiresAt = expiresAt;
    this.isRevoked = isRevoked;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static parseApiResponse(data: any): UserSession | null {
    try {
      return new UserSession(
        data.id,
        data.ipAddress,
        data.userAgent,
        data.deviceFingerprint,
        data.deviceName,
        data.location,
        data.active,
        data.trustedDevice,
        data.version,
        new Date(data.expiresAt),
        data.isRevoked,
        new Date(data.createdAt),
        new Date(data.updatedAt)
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): UserSession[] {
    let arr: UserSession[] = [];
    data.forEach((val) => {
      const d = this.parseApiResponse(val);
      if (d) {
        arr.push(d);
      }
    });
    return arr;
  }

  getDeviceInfo(): string {
    return this.deviceName || this.userAgent || "Unknown device";
  }

  getLocation(): string {
    return this.location || "Unknown location";
  }

  getSessionStatus(): string {
    if (this.isRevoked) return "Revoked";
    if (this.active) return "Active";
    return "Inactive";
  }

  getCreationDate(): string {
    return dayjs(this.createdAt).format("YYYY - MM - DD HH:mm");
  }

  getExpiryDate(): string {
    return dayjs(this.expiresAt).format("YYYY - MM - DD HH:mm");
  }
}
