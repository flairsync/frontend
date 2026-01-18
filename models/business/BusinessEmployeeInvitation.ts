import dayjs from "dayjs";

enum BusinessInvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export class BusinessEmployeeInvitation {
  id: string;
  email: string;
  status: BusinessInvitationStatus;
  resendCount: number;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  token: string;

  constructor(
    id: string,
    email: string,
    status: BusinessInvitationStatus,
    resendCount: number,
    expiresAt: string,
    acceptedAt: string | null,
    declinedAt: string | null,
    createdAt: string,
    updatedAt: string,
    token: string,
  ) {
    this.id = id;
    this.email = email;
    this.status = status;
    this.resendCount = resendCount;
    this.expiresAt = expiresAt;
    this.acceptedAt = acceptedAt;
    this.declinedAt = declinedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.token = token;
  }

  // Parse a single invitation object
  static parseApiResponse(data: any): BusinessEmployeeInvitation | null {
    if (!data) return null;
    try {
      return new BusinessEmployeeInvitation(
        data.id,
        data.email,
        data.status,
        data.resendCount ?? 0,
        data.expiresAt,
        data.acceptedAt ?? null,
        data.declinedAt ?? null,
        data.createdAt,
        data.updatedAt,
        data.token,
      );
    } catch (error) {
      return null;
    }
  }

  // Parse an array of invitation objects
  static parseApiArrayResponse(data: any[]): BusinessEmployeeInvitation[] {
    const arr: BusinessEmployeeInvitation[] = [];
    data.forEach((val) => {
      const invitation = this.parseApiResponse(val);
      if (invitation) arr.push(invitation);
    });
    return arr;
  }

  getCreatedAtDate = () => {
    return dayjs(this.createdAt).format("YYYY/MM/DD HH:mm");
  };

  getExpiryDate = () => {
    return dayjs(this.createdAt).format("YYYY/MM/DD HH:mm");
  };

  isCanceled = () => {
    return this.status == BusinessInvitationStatus.CANCELLED;
  };
}
