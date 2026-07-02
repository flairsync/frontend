import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { CornersDotType, CornersSquareType, DotsType } from "@/features/qr/service";

interface QrLivePreviewProps {
    value: string;
    size?: number;
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

// The logo is never handed to qr-code-styling's own `image` option — that library
// rasterizes it by embedding the image inside an SVG and reloading that SVG as a
// canvas Image, and browsers categorically refuse to load externally-referenced
// images inside an SVG used as an image source (this is separate from, and stricter
// than, CORS). A remote logoUrl also generally can't be read into a data URI
// client-side anyway, since a plain <img> tag can display a cross-origin image with
// no CORS headers at all, but reading its bytes (fetch/canvas export) requires the
// server to opt in via Access-Control-Allow-Origin, which the media host doesn't do
// here. So instead we render the QR code without a logo and visually overlay a plain
// <img> on top — the same technique that already works for the logo thumbnail
// elsewhere in the editor, and it needs no CORS cooperation at all.
export default function QrLivePreview({
    value,
    size = 240,
    dotsColor,
    backgroundColor,
    cornersSquareColor,
    cornersDotColor,
    dotsType,
    cornersSquareType,
    cornersDotType,
    logoUrl,
    logoSize,
    logoMargin,
    margin,
}: QrLivePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
        qrRef.current = new QRCodeStyling({
            width: size,
            height: size,
            data: value,
            margin,
            dotsOptions: { color: dotsColor, type: dotsType },
            backgroundOptions: { color: backgroundColor },
            cornersSquareOptions: { color: cornersSquareColor || dotsColor, type: cornersSquareType },
            cornersDotOptions: { color: cornersDotColor || dotsColor, type: cornersDotType },
        });
        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            qrRef.current.append(containerRef.current);
        }
    }, [
        value,
        size,
        dotsColor,
        backgroundColor,
        cornersSquareColor,
        cornersDotColor,
        dotsType,
        cornersSquareType,
        cornersDotType,
        margin,
    ]);

    const logoBoxSize = size * logoSize;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <div ref={containerRef} />
            {logoUrl && (
                <div
                    className="absolute top-1/2 left-1/2 flex items-center justify-center rounded"
                    style={{
                        width: logoBoxSize + (logoMargin ? 8 : 0),
                        height: logoBoxSize + (logoMargin ? 8 : 0),
                        transform: "translate(-50%, -50%)",
                        backgroundColor: logoMargin ? backgroundColor : "transparent",
                    }}
                >
                    <img
                        src={logoUrl}
                        alt="QR logo"
                        className="object-contain"
                        style={{ width: logoBoxSize, height: logoBoxSize }}
                    />
                </div>
            )}
        </div>
    );
}
