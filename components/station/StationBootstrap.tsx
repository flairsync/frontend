import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { getOrCreateDeviceUuid, getStationToken, setActiveStationType } from "@/features/station/useStationAuth";
import { useStationBootstrap } from "@/features/station/useStationBootstrap";
import PairingScreen from "./PairingScreen";
import POSApp from "./POSApp";
import KDSApp from "./KDSApp";
import { Loader2 } from "lucide-react";

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
  const { urlParsed } = usePageContext();
  const linkCode = (urlParsed.search.linkCode as string) || undefined;
  // Must be set synchronously before any API call or token read so that
  // stationApi / staffApi interceptors pick up the right per-type token.
  setActiveStationType(stationType);

  // null = not yet checked (client-only: device UUID / token live in localStorage/SecureStorage)
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    getOrCreateDeviceUuid();
    setHasToken(!!getStationToken());
  }, []);

  const { data, isLoading, isError, error, refetch } = useStationBootstrap(hasToken === true);

  if (hasToken === null || (hasToken && isLoading)) return <FullScreenLoader />;

  if (hasToken === false) {
    return (
      <PairingScreen
        stationType={stationType}
        initialCode={linkCode}
        onLinked={() => window.location.reload()}
      />
    );
  }

  // 401 is handled by the stationApi interceptor: it clears the token and triggers
  // window.location.reload(), so we intentionally don't flash an error screen for it —
  // only show the retry screen for other errors (5xx, network, etc.) where the device
  // is still validly linked.
  const status401 = (error as any)?.response?.status === 401;
  if (isError && !status401) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center gap-4 text-muted-foreground text-center max-w-xs">
          <p className="text-sm font-bold text-destructive">{t("station_bootstrap.error.title")}</p>
          <p className="text-xs">{t("station_bootstrap.error.description")}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-lg"
          >
            {t("station_bootstrap.error.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <FullScreenLoader />;

  if (stationType === "kds") return <KDSApp station={data.stationInfo} />;
  return <POSApp station={data.stationInfo} bootstrapData={data.bootstrapData} />;
}
