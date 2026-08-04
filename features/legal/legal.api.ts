import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { LegalDocument, LegalDocumentType } from "@/models/LegalDocument";

const baseUrl = `${'https://api.flairsync.com/api/v1'}/legal`;

export const fetchCurrentLegalDocumentApiCall = async (
    type: LegalDocumentType
): Promise<LegalDocument> => unwrap(await flairapi.get(`${baseUrl}/${type}/current`));
