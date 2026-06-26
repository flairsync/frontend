import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getOrCreateDeviceUuid, getStationToken, setActiveStationType } from "@/features/station/useStationAuth";
import { stationApi } from "@/features/station/station-api";
import type { StationInfo } from "@/models/Station";
import type { PosBootstrapData, PosMenu } from "@/features/pos/types";
import PairingScreen from "./PairingScreen";
import POSApp from "./POSApp";
import KDSApp from "./KDSApp";
import { Loader2 } from "lucide-react";

// Map raw API response fields to the PosMenu shape expected by the UI
function normalizePosMenus(raw: any[]): PosMenu[] {
  return raw.map((menu) => ({
    id: menu.id,
    name: menu.name,
    isActive: !menu.deletedAt,
    categories: (menu.categories ?? []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      items: (cat.items ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        basePrice: parseFloat(item.price ?? item.basePrice ?? "0"),
        images: Array.isArray(item.images) ? item.images : item.imageUrl ? [item.imageUrl] : [],
        isAvailable: item.isActive ?? item.isAvailable ?? true,
        variants: (item.variants ?? []).map((v: any) => ({
          id: v.id,
          name: v.name,
          price: parseFloat(v.price ?? "0"),
        })),
        modifierGroups: (item.modifierGroups ?? []).map((mg: any) => ({
          id: mg.id,
          name: mg.name,
          required: mg.required ?? (mg.minSelections > 0),
          minSelections: mg.minSelections ?? 0,
          maxSelections: mg.maxSelections ?? 1,
          items: (mg.items ?? []).map((mgi: any) => ({
            id: mgi.id,
            name: mgi.name,
            price: parseFloat(mgi.price ?? "0"),
          })),
        })),
      })),
    })),
  }));
}

export type StationType = "pos" | "kds";

interface Props {
  stationType: StationType;
}

function FullScreenLoader() {
  const { t } = useTranslation("station");
  return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest">{t("station_bootstrap.initializing")}</p>
      </div>
    </div>
  );
}

export default function StationBootstrap({ stationType }: Props) {
  const { t } = useTranslation("station");
  // Must be set synchronously before any API call or token read so that
  // stationApi / staffApi interceptors pick up the right per-type token.
  setActiveStationType(stationType);

  const [status, setStatus] = useState<"loading" | "pairing" | "error" | "ready">("loading");
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [bootstrapData, setBootstrapData] = useState<PosBootstrapData>({ menus: [], tables: [] });

  const loadBootstrap = async () => {
    setStatus("loading");
    try {
      const [stationRes, menuRes, tableRes] = await Promise.all([
        stationApi.get("/station/me"),
        stationApi.get("/station/menu"),
        stationApi.get("/station/tables"),
      ]);

      setStationInfo(stationRes.data.data);

      const rawMenuArray: any[] = Array.isArray(menuRes.data)
        ? menuRes.data
        : Array.isArray(menuRes.data?.data)
        ? menuRes.data.data
        : [];

      const tables = tableRes.data?.data ?? [];

      setBootstrapData({ menus: normalizePosMenus(rawMenuArray), tables });
      setStatus("ready");
    } catch (err: any) {
      // 401 is handled by the stationApi interceptor: it clears the token and
      // triggers window.location.reload(), so we'll land on pairing automatically.
      // For any other error (5xx, network, etc.) show a retry screen — do NOT
      // clear the token, because the device is still validly linked.
      if (err?.response?.status !== 401) {
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    getOrCreateDeviceUuid();
    const token = getStationToken();

    if (!token) {
      setStatus("pairing");
      return;
    }

    loadBootstrap();
  }, []);

  if (status === "loading") return <FullScreenLoader />;

  if (status === "error") {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center gap-4 text-muted-foreground text-center max-w-xs">
          <p className="text-sm font-bold text-destructive">{t("station_bootstrap.error.title")}</p>
          <p className="text-xs">{t("station_bootstrap.error.description")}</p>
          <button
            onClick={loadBootstrap}
            className="mt-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-lg"
          >
            {t("station_bootstrap.error.retry")}
          </button>
        </div>
      </div>
    );
  }

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
