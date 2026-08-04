import { useQuery } from "@tanstack/react-query";
import { fetchCurrentLegalDocumentApiCall } from "./legal.api";
import { LegalDocumentType } from "@/models/LegalDocument";

export const useLegalDocument = (type: LegalDocumentType) => {
    return useQuery({
        queryKey: ["legal_document", type],
        queryFn: () => fetchCurrentLegalDocumentApiCall(type),
    });
};
