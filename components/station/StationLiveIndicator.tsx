import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { StationSocketStatus } from "@/features/station/useStationSocket";

interface Props {
  status: StationSocketStatus;
}

// Surfaces the realtime order-update channel's health — separate from (and a
// stricter signal than) network online/offline, since the socket can silently
// drop while the NIC stays "online" (server restart, auth hiccup, idle timeout).
export default function StationLiveIndicator({ status }: Props) {
  const { t } = useTranslation("station");

  const config = {
    connected: { dot: "bg-emerald-500", label: t("live_indicator.connected") },
    connecting: { dot: "bg-amber-500 animate-pulse", label: t("live_indicator.connecting") },
    disconnected: { dot: "bg-destructive animate-pulse", label: t("live_indicator.disconnected") },
  }[status];

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted/40"
      title={t("live_indicator.tooltip")}
    >
      <span className={cn("w-2 h-2 rounded-full shrink-0", config.dot)} />
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
        {config.label}
      </span>
    </div>
  );
}
