export type NfcTagStatus = "unissued" | "linked" | "revoked";
export type NfcTagRevokedReason = "lost" | "stolen" | "decommissioned" | "other";
export type NfcTagActionType = "attendance_clock_in_out";

export interface NfcTagAssignedEmploymentProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export class NfcTagAssignedEmployment {
    id: string;
    professionalProfile: NfcTagAssignedEmploymentProfile | null;

    constructor(id: string, professionalProfile: NfcTagAssignedEmploymentProfile | null) {
        this.id = id;
        this.professionalProfile = professionalProfile;
    }

    static parseApiResponse(data: any): NfcTagAssignedEmployment | null {
        if (!data || typeof data !== 'object') return null;
        try {
            return new NfcTagAssignedEmployment(
                data.id,
                data.professionalProfile && typeof data.professionalProfile === 'object'
                    ? {
                        firstName: data.professionalProfile.firstName,
                        lastName: data.professionalProfile.lastName,
                        email: data.professionalProfile.email,
                    }
                    : null,
            );
        } catch (error) {
            console.error("ERROR PARSING NFC TAG ASSIGNED EMPLOYMENT", error, data);
            return null;
        }
    }
}

export class NfcTag {
    id: string;
    status: NfcTagStatus;
    businessId: string | null;
    linkedAt: Date | null;
    revokedAt: Date | null;
    revokedReason: NfcTagRevokedReason | null;
    revokedNote: string | null;
    batchLabel: string | null;
    actionType: NfcTagActionType | null;
    assignedEmploymentId: string | null;
    assignedEmployment: NfcTagAssignedEmployment | null;
    lastScannedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        status: NfcTagStatus,
        businessId: string | null,
        createdAt: Date,
        updatedAt: Date,
        linkedAt?: Date | null,
        revokedAt?: Date | null,
        revokedReason?: NfcTagRevokedReason | null,
        revokedNote?: string | null,
        batchLabel?: string | null,
        actionType?: NfcTagActionType | null,
        assignedEmploymentId?: string | null,
        assignedEmployment?: NfcTagAssignedEmployment | null,
        lastScannedAt?: Date | null,
    ) {
        this.id = id;
        this.status = status;
        this.businessId = businessId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.linkedAt = linkedAt ?? null;
        this.revokedAt = revokedAt ?? null;
        this.revokedReason = revokedReason ?? null;
        this.revokedNote = revokedNote ?? null;
        this.batchLabel = batchLabel ?? null;
        this.actionType = actionType ?? null;
        this.assignedEmploymentId = assignedEmploymentId ?? null;
        this.assignedEmployment = assignedEmployment ?? null;
        this.lastScannedAt = lastScannedAt ?? null;
    }

    static parseApiResponse(data: any): NfcTag | null {
        if (!data || typeof data !== 'object') return null;
        try {
            return new NfcTag(
                data.id,
                data.status,
                data.businessId ?? null,
                data.createdAt ? new Date(data.createdAt) : new Date(),
                data.updatedAt ? new Date(data.updatedAt) : new Date(),
                data.linkedAt ? new Date(data.linkedAt) : null,
                data.revokedAt ? new Date(data.revokedAt) : null,
                data.revokedReason ?? null,
                data.revokedNote ?? null,
                data.batchLabel ?? null,
                data.actionType ?? null,
                data.assignedEmploymentId ?? null,
                data.assignedEmployment && typeof data.assignedEmployment === 'object'
                    ? NfcTagAssignedEmployment.parseApiResponse(data.assignedEmployment)
                    : null,
                data.lastScannedAt ? new Date(data.lastScannedAt) : null,
            );
        } catch (error) {
            console.error("ERROR PARSING NFC TAG", error, data);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): NfcTag[] {
        if (!Array.isArray(data)) return [];
        const arr: NfcTag[] = [];
        data.forEach((val) => {
            const item = this.parseApiResponse(val);
            if (item) arr.push(item);
        });
        return arr;
    }
}
