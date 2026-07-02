import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const getQrUrl = (businessId: string) =>
    `${import.meta.env.BASE_URL}/businesses/${businessId}/qr`;

export type DotsType = "square" | "dots" | "rounded" | "classy" | "classy-rounded" | "extra-rounded";
export type CornersSquareType = "square" | "dot" | "extra-rounded";
export type CornersDotType = "square" | "dot";

export interface QrDesign {
    id: string;
    businessId: string;
    dotsColor: string;
    backgroundColor: string;
    cornersSquareColor?: string | null;
    cornersDotColor?: string | null;
    dotsType: DotsType;
    cornersSquareType: CornersSquareType;
    cornersDotType: CornersDotType;
    logoUrl?: string | null;
    logoSize: number;
    logoMargin: boolean;
    margin: number;
}

export type UpdateQrDesignDto = Partial<
    Omit<QrDesign, "id" | "businessId" | "logoUrl">
>;

export const fetchQrDesignApiCall = async (businessId: string): Promise<QrDesign> =>
    unwrap(await flairapi.get(`${getQrUrl(businessId)}/design`));

export const updateQrDesignApiCall = (businessId: string, data: UpdateQrDesignDto) =>
    flairapi.patch(`${getQrUrl(businessId)}/design`, data);

export const uploadQrLogoApiCall = (businessId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return flairapi.post(`${getQrUrl(businessId)}/design/logo`, formData);
};

export const deleteQrLogoApiCall = (businessId: string) =>
    flairapi.delete(`${getQrUrl(businessId)}/design/logo`);

export type QrPreviewTarget =
    | { type: "business" }
    | { type: "table"; tableId: string };

// Goes through flairapi (not a raw <a href>) so the request carries auth cookies —
// the preview/print endpoints are cookie-protected, a plain navigation would 401.
export const fetchQrPreviewBlob = async (
    businessId: string,
    target: QrPreviewTarget,
    format: "png" | "svg"
): Promise<Blob> => {
    const params = new URLSearchParams({ type: target.type, format });
    if (target.type === "table") params.append("tableId", target.tableId);
    const response = await flairapi.get(`${getQrUrl(businessId)}/preview?${params.toString()}`, {
        responseType: "blob",
    });
    return response.data as Blob;
};

export const fetchQrTablesPdfBlob = async (businessId: string, floorId?: string): Promise<Blob> => {
    const params = floorId ? `?floorId=${floorId}` : "";
    const response = await flairapi.get(`${getQrUrl(businessId)}/tables/pdf${params}`, {
        responseType: "blob",
    });
    return response.data as Blob;
};
