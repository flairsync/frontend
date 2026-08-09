// Minimal ambient types for the WebUSB API (Chrome/Edge only — not in the standard DOM lib,
// unlike most Web APIs, since it's not on the full W3C REC track). Scoped to exactly what
// features/station/webusb-printer.ts uses, not the full spec — extend if a future feature
// needs more of it. See shims.d.ts/google.d.ts for this repo's existing pattern of small
// hand-written ambient declarations over pulling in a third-party @types package.

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USBEndpoint {
  endpointNumber: number;
  direction: "in" | "out";
  type: "bulk" | "interrupt" | "isochronous";
  packetSize: number;
}

interface USBAlternateInterface {
  alternateSetting: number;
  interfaceClass: number;
  interfaceSubclass: number;
  interfaceProtocol: number;
  interfaceName?: string;
  endpoints: USBEndpoint[];
}

interface USBInterface {
  interfaceNumber: number;
  alternate: USBAlternateInterface;
  alternates: USBAlternateInterface[];
  claimed: boolean;
}

interface USBConfiguration {
  configurationValue: number;
  configurationName?: string;
  interfaces: USBInterface[];
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: "ok" | "stall" | "babble";
}

interface USBDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  opened: boolean;
  configuration: USBConfiguration | null;
  configurations: USBConfiguration[];
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  // Typed as Uint8Array rather than the spec's broader BufferSource — that's all this repo
  // ever constructs to send (see webusb-printer.ts), and BufferSource trips a known
  // TS lib mismatch where Uint8Array<ArrayBufferLike> isn't structurally assignable to it.
  transferOut(endpointNumber: number, data: Uint8Array): Promise<USBOutTransferResult>;
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
}

interface Navigator {
  usb?: USB;
}
