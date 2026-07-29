import { useMutation } from "@tanstack/react-query";
import { scanNfcTagApiCall } from "./nfc-scan.service";

export const useNfcScan = () =>
    useMutation({
        mutationFn: ({ tagId, stationId }: { tagId: string; stationId?: string }) =>
            scanNfcTagApiCall(tagId, stationId),
    });
