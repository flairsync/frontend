import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { LegalDocument, LegalDocumentType } from "@/models/LegalDocument";

export const fetchCurrentLegalDocumentApiCall = async (
    type: LegalDocumentType
): Promise<LegalDocument> => unwrap(await flairapi.get(`/legal/${type}/current`));
