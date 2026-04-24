import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { BarcodeFormat, Result } from "@zxing/library";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, FlipHorizontal, ScanLine, ShieldAlert, Loader2, ShieldCheck, ExternalLink } from "lucide-react";

// ─── Format helpers ───────────────────────────────────────────────────────────

const FORMAT_LABELS: Partial<Record<BarcodeFormat, string>> = {
    [BarcodeFormat.EAN_13]: "EAN-13",
    [BarcodeFormat.EAN_8]: "EAN-8",
    [BarcodeFormat.CODE_128]: "Code 128",
    [BarcodeFormat.CODE_39]: "Code 39",
    [BarcodeFormat.UPC_A]: "UPC-A",
    [BarcodeFormat.UPC_E]: "UPC-E",
    [BarcodeFormat.QR_CODE]: "QR Code",
    [BarcodeFormat.DATA_MATRIX]: "Data Matrix",
    [BarcodeFormat.ITF]: "ITF",
};

function getFormatLabel(result: Result): string {
    return FORMAT_LABELS[result.getBarcodeFormat()] ?? "Barcode";
}

// ─── Permission state type ────────────────────────────────────────────────────

type PermissionState = "checking" | "prompt" | "granted" | "denied" | "unsupported";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BarcodeScannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDetected: (barcode: string, format: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
    open,
    onOpenChange,
    onDetected,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const permissionStatusRef = useRef<PermissionStatus | null>(null);

    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>();
    const [permission, setPermission] = useState<PermissionState>("checking");
    const [scanStatus, setScanStatus] = useState<"idle" | "loading" | "scanning" | "error">("idle");
    const [scanError, setScanError] = useState("");
    const [detectedFlash, setDetectedFlash] = useState(false);

    // ── Scanner helpers ────────────────────────────────────────────────────────

    const stopScanner = useCallback(() => {
        controlsRef.current?.stop();
        controlsRef.current = null;
    }, []);

    const startScanner = useCallback(async (cameraId?: string) => {
        if (!videoRef.current) return;

        stopScanner();
        setScanStatus("loading");
        setScanError("");

        try {
            const devices = await BrowserMultiFormatReader.listVideoInputDevices();
            setCameras(devices);

            let deviceId = cameraId;
            if (!deviceId) {
                const rear = devices.find((d) => /back|rear|environment/i.test(d.label));
                deviceId = rear?.deviceId ?? devices[devices.length - 1]?.deviceId;
            }
            setSelectedCameraId(deviceId);

            const reader = new BrowserMultiFormatReader();
            const controls = await reader.decodeFromVideoDevice(
                deviceId,
                videoRef.current,
                (result) => {
                    if (!result) return;
                    const text = result.getText();
                    const format = getFormatLabel(result);
                    stopScanner();
                    setDetectedFlash(true);
                    setTimeout(() => {
                        setDetectedFlash(false);
                        onDetected(text, format);
                        onOpenChange(false);
                    }, 250);
                }
            );
            controlsRef.current = controls;
            setScanStatus("scanning");
        } catch (err: any) {
            stopScanner();
            // NotAllowedError here means permission was revoked between check and start
            if (err?.name === "NotAllowedError") {
                setPermission("denied");
            } else if (err?.name === "NotFoundError") {
                setScanError("No camera found on this device.");
                setScanStatus("error");
            } else {
                setScanError("Could not start the camera. Please try again.");
                setScanStatus("error");
            }
        }
    }, [stopScanner, onDetected, onOpenChange]);

    // ── Permission helpers ─────────────────────────────────────────────────────

    const applyPermissionState = useCallback((state: PermissionStatus["state"]) => {
        if (state === "granted") {
            setPermission("granted");
            startScanner(selectedCameraId);
        } else if (state === "denied") {
            setPermission("denied");
            stopScanner();
            setScanStatus("idle");
        } else {
            // "prompt" — we haven't asked yet
            setPermission("prompt");
        }
    }, [startScanner, stopScanner, selectedCameraId]);

    const checkPermission = useCallback(async () => {
        setPermission("checking");
        setScanStatus("idle");
        setScanError("");

        // Permissions API not available (some older browsers / iOS < 16)
        if (!navigator.permissions) {
            setPermission("unsupported");
            startScanner(selectedCameraId);
            return;
        }

        try {
            const status = await navigator.permissions.query({ name: "camera" as PermissionName });
            permissionStatusRef.current = status;
            applyPermissionState(status.state);

            // React to runtime permission changes (e.g. user re-enables from OS settings)
            status.onchange = () => applyPermissionState(status.state);
        } catch {
            // browser supports Permissions API but not the "camera" query (Firefox)
            setPermission("unsupported");
            startScanner(selectedCameraId);
        }
    }, [applyPermissionState, startScanner, selectedCameraId]);

    // Explicitly request permission by calling getUserMedia — triggers the browser prompt
    const requestPermission = useCallback(async () => {
        setScanStatus("loading");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // stop the test stream immediately; startScanner will open its own
            stream.getTracks().forEach((t) => t.stop());
            setPermission("granted");
            startScanner(selectedCameraId);
        } catch (err: any) {
            if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                setPermission("denied");
            } else if (err?.name === "NotFoundError") {
                setScanError("No camera found on this device.");
                setScanStatus("error");
            } else {
                setScanError("Could not access the camera. Please try again.");
                setScanStatus("error");
            }
            setScanStatus("idle");
        }
    }, [startScanner, selectedCameraId]);

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (open) {
            checkPermission();
        } else {
            stopScanner();
            setScanStatus("idle");
            setPermission("checking");
            // remove permission change listener
            if (permissionStatusRef.current) {
                permissionStatusRef.current.onchange = null;
            }
        }
        return () => {
            stopScanner();
            if (permissionStatusRef.current) {
                permissionStatusRef.current.onchange = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // ── Camera controls ────────────────────────────────────────────────────────

    const handleCameraSwitch = (deviceId: string) => {
        setSelectedCameraId(deviceId);
        startScanner(deviceId);
    };

    const nextCamera = () => {
        if (cameras.length < 2) return;
        const idx = cameras.findIndex((c) => c.deviceId === selectedCameraId);
        const next = cameras[(idx + 1) % cameras.length];
        handleCameraSwitch(next.deviceId);
    };

    // ── Render helpers ─────────────────────────────────────────────────────────

    const renderViewfinderOverlay = () => {
        // 1. Checking permission
        if (permission === "checking") {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <p className="text-white text-sm">Checking camera permission…</p>
                </div>
            );
        }

        // 2. Need to ask — show explanation + grant button
        if (permission === "prompt") {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 p-6 text-center">
                    <div className="rounded-full bg-white/10 p-4">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-semibold text-sm">Camera access needed</p>
                        <p className="text-white/60 text-xs leading-relaxed">
                            Allow camera access so you can scan barcodes directly from your device.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="gap-2 bg-green-500 hover:bg-green-600 text-white border-0"
                        onClick={requestPermission}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Grant Camera Access
                    </Button>
                </div>
            );
        }

        // 3. Permanently denied — guide to settings
        if (permission === "denied") {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 p-6 text-center">
                    <div className="rounded-full bg-red-500/20 p-4">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-semibold text-sm">Camera access blocked</p>
                        <p className="text-white/60 text-xs leading-relaxed">
                            Camera permission was denied. To enable it, open your browser or device settings and allow camera access for this site.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-white/20 text-white hover:bg-white/10"
                        onClick={() => window.open("about:blank", "_blank")}
                        title="Open browser settings"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Settings
                    </Button>
                </div>
            );
        }

        // 4. Granted — show scanner overlays
        if (permission === "granted" || permission === "unsupported") {
            return (
                <>
                    {/* Scan line */}
                    {scanStatus === "scanning" && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="scan-line" />
                        </div>
                    )}

                    {/* Corner brackets */}
                    {scanStatus === "scanning" && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="relative w-48 h-48">
                                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl" />
                                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr" />
                                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl" />
                                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br" />
                            </div>
                        </div>
                    )}

                    {/* Camera loading */}
                    {scanStatus === "loading" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                            <p className="text-white text-sm">Starting camera…</p>
                        </div>
                    )}

                    {/* Scan error */}
                    {scanStatus === "error" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 p-6 text-center">
                            <ShieldAlert className="w-10 h-10 text-red-400" />
                            <p className="text-white text-sm">{scanError}</p>
                            <Button size="sm" variant="secondary" onClick={() => startScanner(selectedCameraId)}>
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Detected flash */}
                    {detectedFlash && (
                        <div className="absolute inset-0 bg-green-400/40 pointer-events-none animate-pulse" />
                    )}
                </>
            );
        }

        return null;
    };

    // ── JSX ────────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <ScanLine className="w-4 h-4" />
                        Scan Barcode
                    </DialogTitle>
                </DialogHeader>

                {/* Viewfinder — always rendered so videoRef is available */}
                <div className="relative w-full bg-black aspect-square overflow-hidden">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                    />
                    {renderViewfinderOverlay()}
                </div>

                {/* Bottom controls — only shown when scanning is active */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-background">
                    {(permission === "granted" || permission === "unsupported") && cameras.length > 1 ? (
                        <>
                            <Select value={selectedCameraId} onValueChange={handleCameraSwitch}>
                                <SelectTrigger className="h-8 text-xs flex-1 max-w-[200px]">
                                    <Camera className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                    <SelectValue placeholder="Select camera" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cameras.map((cam, i) => (
                                        <SelectItem key={cam.deviceId} value={cam.deviceId} className="text-xs">
                                            {cam.label || `Camera ${i + 1}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 shrink-0"
                                onClick={nextCamera}
                                title="Switch camera"
                            >
                                <FlipHorizontal className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {permission === "denied"
                                ? "Enable camera in your browser settings to scan"
                                : permission === "prompt"
                                ? "Grant camera access to start scanning"
                                : "Point camera at a barcode"}
                        </span>
                    )}
                </div>

                <style>{`
                    @keyframes scan {
                        0%   { top: 10%; }
                        50%  { top: 85%; }
                        100% { top: 10%; }
                    }
                    .scan-line {
                        position: absolute;
                        left: 10%;
                        right: 10%;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #4ade80, transparent);
                        box-shadow: 0 0 6px 1px #4ade80;
                        animation: scan 2.4s ease-in-out infinite;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
};
