import { useEffect, useState } from "react";
import { getOrCreateDeviceUuid, getStationToken, clearStationToken } from "@/features/station/useStationAuth";
import { stationApi } from "@/features/station/station-api";
import type { StationInfo } from "@/models/Station";
import type { PosBootstrapData } from "@/features/pos/types";
import PairingScreen from "./PairingScreen";
import POSApp from "./POSApp";
import KDSApp from "./KDSApp";
import { Loader2 } from "lucide-react";

export type StationType = "pos" | "kds";

interface Props {
  stationType: StationType;
}

function FullScreenLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest">Initializing station...</p>
      </div>
    </div>
  );
}

export default function StationBootstrap({ stationType }: Props) {
  const [status, setStatus] = useState<"loading" | "pairing" | "ready">("loading");
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [bootstrapData, setBootstrapData] = useState<PosBootstrapData>({ menus: [], tables: [] });

  useEffect(() => {
    getOrCreateDeviceUuid();
    const token = getStationToken();

    if (!token) {
      setStatus("pairing");
      return;
    }

    const loadBootstrap = async () => {
      try {
        const [stationRes, menuRes, tableRes] = await Promise.all([
          stationApi.get("/station/me"),
          stationApi.get("/station/menu"),
          stationApi.get("/station/tables"),
        ]);

        setStationInfo(stationRes.data.data);

        // Menu endpoint returns array directly or nested under data
        const rawMenus = menuRes.data;
        const menus = Array.isArray(rawMenus)
          ? rawMenus
          : Array.isArray(rawMenus?.data)
          ? rawMenus.data
          : [];

        const tables = tableRes.data?.data ?? [];

        setBootstrapData({ menus, tables });
        setStatus("ready");
      } catch {
        clearStationToken();
        setStatus("pairing");
      }
    };

    loadBootstrap();
  }, []);

  if (status === "loading") return <FullScreenLoader />;

  if (status === "pairing") {
    return (
      <PairingScreen
        stationType={stationType}
        onLinked={() => window.location.reload()}
      />
    );
  }

  if (stationType === "kds") return <KDSApp station={stationInfo!} />;
  return <POSApp station={stationInfo!} bootstrapData={bootstrapData} />;
}
