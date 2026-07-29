export type NfcCardRequestReason = "new_staff_card" | "lost_replacement" | "other";
export type NfcCardRequestStatus = "pending" | "fulfilled" | "rejected";

export class NfcCardRequest {
    id: string;
    businessId: string;
    requestedById: string;
    reason: NfcCardRequestReason;
    note: string | null;
    status: NfcCardRequestStatus;
    fulfilledTagId: string | null;
    resolvedAt: Date | null;
    resolvedById: string | null;
    resolutionNote: string | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        businessId: string,
        requestedById: string,
        reason: NfcCardRequestReason,
        status: NfcCardRequestStatus,
        createdAt: Date,
        updatedAt: Date,
        note?: string | null,
        fulfilledTagId?: string | null,
        resolvedAt?: Date | null,
        resolvedById?: string | null,
        resolutionNote?: string | null,
    ) {
        this.id = id;
        this.businessId = businessId;
        this.requestedById = requestedById;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.note = note ?? null;
        this.fulfilledTagId = fulfilledTagId ?? null;
        this.resolvedAt = resolvedAt ?? null;
        this.resolvedById = resolvedById ?? null;
        this.resolutionNote = resolutionNote ?? null;
    }

    static parseApiResponse(data: any): NfcCardRequest | null {
        if (!data || typeof data !== 'object') return null;
        try {
            return new NfcCardRequest(
                data.id,
                data.businessId,
                data.requestedById,
                data.reason,
                data.status,
                data.createdAt ? new Date(data.createdAt) : new Date(),
                data.updatedAt ? new Date(data.updatedAt) : new Date(),
                data.note ?? null,
                data.fulfilledTagId ?? null,
                data.resolvedAt ? new Date(data.resolvedAt) : null,
                data.resolvedById ?? null,
                data.resolutionNote ?? null,
            );
        } catch (error) {
            console.error("ERROR PARSING NFC CARD REQUEST", error, data);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): NfcCardRequest[] {
        if (!Array.isArray(data)) return [];
        const arr: NfcCardRequest[] = [];
        data.forEach((val) => {
            const item = this.parseApiResponse(val);
            if (item) arr.push(item);
        });
        return arr;
    }
}
