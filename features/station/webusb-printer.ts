import { getStationOrderPrintBytesApiCall } from "./station-api";

// Client-side WebUSB printing — the browser talks to a USB-attached printer directly, no
// backend socket, no relay agent. Chrome/Edge only (Safari/Firefox have no WebUSB), and only
// for printers physically wired via USB (not WiFi/network ones — those still need
// escpos_network + a reachable host, or a future relay). See PrinterType's backend comment
// for the full reasoning behind this split.

export interface PairedPrinterInfo {
  vendorId: number;
  productId: number;
  productName: string;
}

export function isWebUsbSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.usb;
}

// Persisted purely so the settings UI can show "Paired: <name>" without re-prompting on
// every page load — the actual permission grant lives in the browser's own per-origin WebUSB
// store (navigator.usb.getDevices()), this is just a hint for which of possibly-several
// already-authorized devices is the one this station means.
function hintKey(stationId: string) {
  return `webusb_printer_${stationId}`;
}

function readHint(stationId: string): PairedPrinterInfo | null {
  try {
    const raw = localStorage.getItem(hintKey(stationId));
    return raw ? (JSON.parse(raw) as PairedPrinterInfo) : null;
  } catch {
    return null;
  }
}

function writeHint(stationId: string, info: PairedPrinterInfo) {
  try {
    localStorage.setItem(hintKey(stationId), JSON.stringify(info));
  } catch {
    /* localStorage unavailable (private browsing, quota) — hint is a convenience, not required */
  }
}

export function clearPairedPrinterHint(stationId: string) {
  try {
    localStorage.removeItem(hintKey(stationId));
  } catch {
    /* ignore */
  }
}

export function getPairedPrinterHint(stationId: string): PairedPrinterInfo | null {
  return readHint(stationId);
}

// Opens the browser's device picker. Only resolves once the user actually selects a device —
// rejects with a DOMException (name "NotFoundError") if they cancel, which callers should
// treat as a silent no-op, not an error to surface.
export async function pairPrinter(stationId: string): Promise<PairedPrinterInfo> {
  if (!navigator.usb) throw new Error("WebUSB isn't supported in this browser.");
  const device = await navigator.usb.requestDevice({ filters: [] });
  const info: PairedPrinterInfo = {
    vendorId: device.vendorId,
    productId: device.productId,
    productName: device.productName || `USB device ${device.vendorId.toString(16)}:${device.productId.toString(16)}`,
  };
  writeHint(stationId, info);
  return info;
}

// Already-authorized devices only (no new permission prompt) — matches this station's stored
// hint if there is one and it's still authorized; falls back to the sole authorized device if
// there's exactly one (covers the common case where the hint was cleared but pairing wasn't
// redone); returns null if there's none, or more than one with no way to disambiguate.
async function getPairedDevice(stationId: string): Promise<USBDevice | null> {
  if (!navigator.usb) return null;
  const devices = await navigator.usb.getDevices();
  if (devices.length === 0) return null;

  const hint = readHint(stationId);
  if (hint) {
    const match = devices.find((d) => d.vendorId === hint.vendorId && d.productId === hint.productId);
    if (match) return match;
  }
  return devices.length === 1 ? devices[0] : null;
}

// Opens the device and claims whichever interface exposes a bulk OUT endpoint — prefers USB
// Printer class (7) if present, but falls back to the first usable interface since many cheap
// clone thermal printers don't report class 7 correctly.
async function ensureDeviceReady(device: USBDevice): Promise<{ endpointNumber: number }> {
  if (!device.opened) await device.open();
  if (device.configuration === null) await device.selectConfiguration(1);

  const config = device.configuration;
  if (!config) throw new Error("Couldn't read this USB device's configuration.");

  const byPrinterClassFirst = [...config.interfaces].sort(
    (a, b) => (b.alternate.interfaceClass === 7 ? 1 : 0) - (a.alternate.interfaceClass === 7 ? 1 : 0),
  );

  for (const iface of byPrinterClassFirst) {
    const outEndpoint = iface.alternate.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
    if (!outEndpoint) continue;
    if (!iface.claimed) await device.claimInterface(iface.interfaceNumber);
    return { endpointNumber: outEndpoint.endpointNumber };
  }

  throw new Error("This USB device doesn't look like a printer (no bulk OUT endpoint found).");
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sendBytes(device: USBDevice, bytes: Uint8Array): Promise<void> {
  const { endpointNumber } = await ensureDeviceReady(device);
  const result = await device.transferOut(endpointNumber, bytes);
  if (result.status !== "ok") {
    throw new Error(`Printer reported a transfer error (${result.status}).`);
  }
}

export interface WebUsbPrintResult {
  success: boolean;
  message: string;
}

// Fetches the pre-built ESC/POS bytes for an order from the backend (same command builder
// the network-printer path uses — see StationService.getReceiptPrintBytes) and sends them to
// the paired USB device directly. Mirrors printStationOrderApiCall's {success, message}
// shape so callers don't need a second error-handling path for this transport.
export async function printOrderViaWebUsb(stationId: string, orderId: string): Promise<WebUsbPrintResult> {
  if (!isWebUsbSupported()) {
    return { success: false, message: "WebUSB isn't supported in this browser." };
  }

  const device = await getPairedDevice(stationId);
  if (!device) {
    return { success: false, message: "No USB printer paired for this station yet." };
  }

  const response = await getStationOrderPrintBytesApiCall(orderId);
  const result = response.data.data;
  if (!result.success || !result.bytesBase64) {
    return { success: false, message: result.message || "Couldn't prepare the receipt for printing." };
  }

  try {
    await sendBytes(device, base64ToBytes(result.bytesBase64));
    return { success: true, message: "Printed." };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to send the print job to the USB printer." };
  }
}

// ESC @ (init) + a short message + feed + cut — built directly here rather than round-
// tripping to the backend, since a test print isn't tied to any real order/receipt data.
function buildTestPrintBytes(): Uint8Array {
  const ESC = 0x1b;
  const GS = 0x1d;
  const text = `FlairSync test print\n${new Date().toLocaleString()}\nIf you can read this, WebUSB printing works.\n`;
  const encoder = new TextEncoder();
  return new Uint8Array([
    ESC, 0x40, // initialize
    ...encoder.encode(text),
    0x0a, 0x0a, 0x0a, // feed
    GS, 0x56, 0x00, // cut
  ]);
}

export async function testWebUsbPrint(stationId: string): Promise<WebUsbPrintResult> {
  if (!isWebUsbSupported()) {
    return { success: false, message: "WebUSB isn't supported in this browser." };
  }
  const device = await getPairedDevice(stationId);
  if (!device) {
    return { success: false, message: "No USB printer paired for this station yet." };
  }
  try {
    await sendBytes(device, buildTestPrintBytes());
    return { success: true, message: "Test print sent." };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to reach the USB printer." };
  }
}
