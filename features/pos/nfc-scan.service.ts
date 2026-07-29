import { publicApi } from "@/features/station/station-api";

export interface NfcScanResult {
    action: "check_in" | "check_out";
    attendance: unknown;
}

// /nfc-tags/scan is intentionally public — physical possession of the badge is the
// credential, same trust model as the owner's /nfc-tags/link redemption call.
export const scanNfcTagApiCall = async (tagId: string): Promise<NfcScanResult> => {
    const res = await publicApi.post("/nfc-tags/scan", { tagId });
    return res.data.data;
};
