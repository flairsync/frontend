import { useMutation } from "@tanstack/react-query";
import { scanNfcTagApiCall } from "./nfc-scan.service";

export const useNfcScan = () =>
    useMutation({
        mutationFn: (tagId: string) => scanNfcTagApiCall(tagId),
    });
