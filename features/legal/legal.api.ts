import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { LegalDocument, LegalDocumentType } from "@/models/LegalDocument";

const baseUrl = `${API_URL}/legal`;

export const fetchCurrentLegalDocumentApiCall = async (
    type: LegalDocumentType
): Promise<LegalDocument> => unwrap(await flairapi.get(`${baseUrl}/${type}/current`));
