export type OwnershipTransferStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export class OwnershipTransfer {
  id: string;
  businessId: string;
  newOwnerUserId: string;
  status: OwnershipTransferStatus;
  token: string;
  tokenExpiresAt: Date;
  confirmedAt: Date | null;
  graceEndsAt: Date | null;
  cancelledAt: Date | null;
  completedAt: Date | null;
  businessName?: string | null;
  isNewOwner?: boolean;

  constructor(data: {
    id: string;
    businessId: string;
    newOwnerUserId: string;
    status: OwnershipTransferStatus;
    token: string;
    tokenExpiresAt: Date;
    confirmedAt: Date | null;
    graceEndsAt: Date | null;
    cancelledAt: Date | null;
    completedAt: Date | null;
    businessName?: string | null;
    isNewOwner?: boolean;
  }) {
    this.id = data.id;
    this.businessId = data.businessId;
    this.newOwnerUserId = data.newOwnerUserId;
    this.status = data.status;
    this.token = data.token;
    this.tokenExpiresAt = data.tokenExpiresAt;
    this.confirmedAt = data.confirmedAt;
    this.graceEndsAt = data.graceEndsAt;
    this.cancelledAt = data.cancelledAt;
    this.completedAt = data.completedAt;
    this.businessName = data.businessName;
    this.isNewOwner = data.isNewOwner;
  }

  static parseApiResponse(data: any): OwnershipTransfer {
    return new OwnershipTransfer({
      id: data.id,
      businessId: data.businessId,
      newOwnerUserId: data.newOwnerUserId,
      status: data.status,
      token: data.token,
      tokenExpiresAt: new Date(data.tokenExpiresAt),
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : null,
      graceEndsAt: data.graceEndsAt ? new Date(data.graceEndsAt) : null,
      cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : null,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      businessName: data.businessName ?? null,
      isNewOwner: data.isNewOwner,
    });
  }
}
