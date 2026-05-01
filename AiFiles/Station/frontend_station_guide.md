# Station Frontend Integration Guide

## POS & KDS — `flairsync.com/station/pos` | `flairsync.com/station/kds`

---

## Overview

The station system allows physical devices (tablets, terminals) to register themselves to a business and operate as a POS or KDS. The device identity is persisted in `localStorage`. The pairing flow is owner-initiated from the dashboard.

Two distinct actor types:

- **Dashboard user** (owner/manager) — generates pairing codes, manages stations
- **Station device** — pairs itself, then operates using a long-lived device token

---

## Device Identity

The device generates and persists a UUID in `localStorage` — this is its permanent identity across sessions.

```ts
// src/station/shared/useStationAuth.ts

const DEVICE_UUID_KEY = "flairsync_device_uuid";
const STATION_TOKEN_KEY = "flairsync_station_token";

export function getOrCreateDeviceUuid(): string {
  let uuid = localStorage.getItem(DEVICE_UUID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(DEVICE_UUID_KEY, uuid);
  }
  return uuid;
}

export function getStationToken(): string | null {
  return localStorage.getItem(STATION_TOKEN_KEY);
}

export function saveStationToken(token: string): void {
  localStorage.setItem(STATION_TOKEN_KEY, token);
}

export function clearStationToken(): void {
  localStorage.removeItem(STATION_TOKEN_KEY);
}
```

---

## Bootstrap Flow

Every time the station app loads, `StationBootstrap.tsx` runs this decision tree:

```
Device loads /station/pos or /station/kds
        │
        ▼
Does localStorage have a station token?
        │
   NO ──┴── YES ──► Call GET /station/me with token
        │                    │
        ▼                401? ──► clear token → show PairingScreen
   Show PairingScreen    200? ──► load POS/KDS interface
```

```tsx
// src/station/shared/StationBootstrap.tsx

import { useEffect, useState } from "react";
import {
  getOrCreateDeviceUuid,
  getStationToken,
  clearStationToken,
} from "./useStationAuth";
import { stationApi } from "./station-api";
import PairingScreen from "./PairingScreen";
import POSApp from "../pos/POSApp";
import KDSApp from "../kds/KDSApp";

export type StationType = "pos" | "kds";

interface Props {
  stationType: StationType;
}

export default function StationBootstrap({ stationType }: Props) {
  const [status, setStatus] = useState<"loading" | "pairing" | "ready">(
    "loading",
  );
  const [stationInfo, setStationInfo] = useState<any>(null);

  useEffect(() => {
    getOrCreateDeviceUuid(); // ensure UUID exists
    const token = getStationToken();

    if (!token) {
      setStatus("pairing");
      return;
    }

    stationApi
      .get("/station/me")
      .then((res) => {
        setStationInfo(res.data.data);
        setStatus("ready");
      })
      .catch(() => {
        clearStationToken();
        setStatus("pairing");
      });
  }, []);

  if (status === "loading") return <FullScreenLoader />;
  if (status === "pairing")
    return (
      <PairingScreen
        stationType={stationType}
        onLinked={() => window.location.reload()}
      />
    );

  if (stationType === "kds") return <KDSApp station={stationInfo} />;
  return <POSApp station={stationInfo} />;
}
```

---

## Pairing Screen

Shown when the device has no valid token. The operator gets a code from the dashboard and types it here.

```tsx
// src/station/shared/PairingScreen.tsx

import { useState } from "react";
import { getOrCreateDeviceUuid, saveStationToken } from "./useStationAuth";
import { publicApi } from "./station-api";

interface Props {
  stationType: "pos" | "kds";
  onLinked: () => void;
}

export default function PairingScreen({ stationType, onLinked }: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLink() {
    if (code.length !== 8 || !name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await publicApi.post("/station/link", {
        deviceUuid: getOrCreateDeviceUuid(),
        code: code.toUpperCase(),
        name: name.trim(),
        type: stationType,
      });
      saveStationToken(res.data.data.token);
      onLinked();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Link this device</h1>
        <p className="text-gray-400 mt-2">
          Ask the business owner to generate a pairing code from the dashboard.
        </p>
      </div>

      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4">
        <input
          placeholder="Station name (e.g. Main POS)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <input
          placeholder="8-character code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          className="input text-center text-2xl tracking-widest font-mono uppercase"
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          onClick={handleLink}
          disabled={loading || code.length !== 8 || !name.trim()}
          className="btn-primary"
        >
          {loading ? "Linking..." : "Link Device"}
        </button>
      </div>

      <p className="text-gray-600 text-xs">
        Device ID: {getOrCreateDeviceUuid().slice(0, 8)}...
      </p>
    </div>
  );
}
```

---

## API Clients

Two separate axios instances — one for station-authenticated requests, one for the public link endpoint.

```ts
// src/station/shared/station-api.ts
import axios from "axios";
import { getStationToken, clearStationToken } from "./useStationAuth";

const BASE = import.meta.env.VITE_API_URL; // e.g. https://api.flairsync.com

// For station-authenticated requests (uses device token)
export const stationApi = axios.create({ baseURL: BASE });

stationApi.interceptors.request.use((config) => {
  const token = getStationToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

stationApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      clearStationToken();
      window.location.reload(); // triggers PairingScreen
    }
    return Promise.reject(err);
  },
);

// For the public link endpoint (no auth)
export const publicApi = axios.create({ baseURL: BASE });
```

---

## Routing

Add station routes to your router. These are lazy-loaded so dashboard users never download station code.

```tsx
// React Router v6 example
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const StationBootstrap = lazy(
  () => import("./station/shared/StationBootstrap"),
);

function AppRouter() {
  return (
    <Routes>
      {/* Main dashboard routes */}
      <Route path="/*" element={<DashboardApp />} />

      {/* Station routes — lazy loaded, completely separate chunk */}
      <Route
        path="/station/pos"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <StationBootstrap stationType="pos" />
          </Suspense>
        }
      />
      <Route
        path="/station/kds"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <StationBootstrap stationType="kds" />
          </Suspense>
        }
      />
    </Routes>
  );
}
```

---

## Dashboard — Station Management (Owner Side)

The owner uses these flows inside the existing dashboard app.

### Generate a Pairing Code

```ts
// Called when owner clicks "Add Station" in their dashboard
async function generatePairingCode(businessId: string) {
  const res = await dashboardApi.post(
    `/station/businesses/${businessId}/pairing-codes`,
  );
  return res.data.data; // { code: 'AB3X7K2M', expiresAt: '2026-04-27T...' }
}
```

Display the code prominently. It expires in **5 minutes**. Show a countdown timer. No auto-refresh — the owner must click "Generate New Code" again if it expires.

```tsx
function PairingCodeDisplay({
  code,
  expiresAt,
}: {
  code: string;
  expiresAt: string;
}) {
  const secondsLeft = useCountdown(new Date(expiresAt));

  return (
    <div className="text-center p-8 border rounded-xl">
      <p className="text-sm text-gray-500 mb-2">
        Enter this code on the station device
      </p>
      <p className="text-5xl font-mono font-bold tracking-widest">{code}</p>
      <p className="text-sm text-gray-400 mt-4">Expires in {secondsLeft}s</p>
    </div>
  );
}
```

### List & Manage Stations

```ts
// GET /station/businesses/:businessId/stations
async function listStations(businessId: string) {
  const res = await dashboardApi.get(
    `/station/businesses/${businessId}/stations`,
  );
  return res.data.data; // Station[]
}

// PATCH /station/businesses/:businessId/stations/:stationId
async function updateStation(
  businessId: string,
  stationId: string,
  payload: { name?: string; type?: "pos" | "kds" },
) {
  const res = await dashboardApi.patch(
    `/station/businesses/${businessId}/stations/${stationId}`,
    payload,
  );
  return res.data.data;
}

// DELETE /station/businesses/:businessId/stations/:stationId
async function revokeStation(businessId: string, stationId: string) {
  await dashboardApi.delete(
    `/station/businesses/${businessId}/stations/${stationId}`,
  );
  // Device token is immediately invalidated — next station request returns 401
}
```

---

## Station Info Shape (GET /station/me response)

```ts
interface StationInfo {
  id: string;
  deviceUuid: string;
  name: string;
  type: "pos" | "kds";
  businessId: string;
  isActive: boolean;
  lastSeenAt: string;
  business: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    allowTableOrdering: boolean;
    allowTakeawayOrdering: boolean;
    // ... other business config fields
  };
}
```

---

## Heartbeat

Send a heartbeat every 60 seconds while the station is active. Used to show "online/offline" status in the dashboard.

```ts
// In the root POS/KDS component
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      await stationApi.post("/station/heartbeat");
    } catch {
      // silent — 401 will trigger the interceptor and redirect to pairing
    }
  }, 60_000);

  return () => clearInterval(interval);
}, []);
```

---

## Security Notes for Frontend

- **Never store the device UUID as a user-editable field** — generate it once with `crypto.randomUUID()` and only read it after.
- **The station token is not a user token** — do not send it to user-auth endpoints. Keep `stationApi` and `dashboardApi` strictly separate.
- **localStorage clearing = de-registration from the device side** — the token in the DB is still valid until the owner revokes it from the dashboard. If a user clears storage, they just need to re-enter a pairing code.
- **Revocation is instant** — when the owner revokes a station, the next request from that device returns 401, the interceptor fires, storage is cleared, and PairingScreen appears.

---

## Environment Variables

```env
VITE_API_URL=https://api.flairsync.com
```

---

## API Reference Summary

| Method   | Path                                                  | Auth         | Description                                   |
| -------- | ----------------------------------------------------- | ------------ | --------------------------------------------- |
| `POST`   | `/station/businesses/:businessId/pairing-codes`       | User JWT     | Generate pairing code                         |
| `GET`    | `/station/businesses/:businessId/stations`            | User JWT     | List business stations                        |
| `PATCH`  | `/station/businesses/:businessId/stations/:stationId` | User JWT     | Rename or change type                         |
| `DELETE` | `/station/businesses/:businessId/stations/:stationId` | User JWT     | Revoke station                                |
| `POST`   | `/station/link`                                       | None         | Link device with pairing code → returns token |
| `GET`    | `/station/me`                                         | Device token | Get station info + business config            |
| `POST`   | `/station/heartbeat`                                  | Device token | Update lastSeenAt                             |
