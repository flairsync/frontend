import { publicApi } from "@/features/station/station-api";
import { PosPermissions } from "@/features/pos/useStaffSession";

export interface NfcScanAttendanceResult {
    action: "check_in" | "check_out";
    attendance: unknown;
}

export interface NfcScanPosLoginResult {
    action: "pos_login";
    session: {
        employmentId: string;
        name: string;
        roles: Array<{ id: string; name: string }>;
        posPermissions: PosPermissions;
        shortToken: string;
    };
}

export type NfcScanResult = NfcScanAttendanceResult | NfcScanPosLoginResult;

// /nfc-tags/scan is intentionally public — physical possession of the badge is the
// credential, same trust model as the owner's /nfc-tags/link redemption call.
// stationId is only required for a pos_login-actioned tag (it has no device
// auth of its own to derive the station from, unlike /station/staff/pin-login).
export const scanNfcTagApiCall = async (tagId: string, stationId?: string): Promise<NfcScanResult> => {
    const res = await publicApi.post("/nfc-tags/scan", { tagId, stationId });
    return res.data.data;
};
