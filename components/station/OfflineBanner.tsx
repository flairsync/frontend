import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  pendingCount?: number;
}

export default function OfflineBanner({ pendingCount = 0 }: Props) {
  const { t } = useTranslation("station");

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 text-amber-950 text-sm font-semibold py-2 px-4 shrink-0 animate-in slide-in-from-top">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        {pendingCount > 0
          ? t("offline_banner.message_with_count", {
              count: pendingCount,
              defaultValue: "No connection — {{count}} action(s) saved, will sync automatically",
            })
          : t("offline_banner.message", {
              defaultValue: "No connection — actions are being saved and will sync automatically",
            })}
      </span>
    </div>
  );
}
