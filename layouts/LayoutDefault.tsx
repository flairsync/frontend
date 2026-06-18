import "./style.css";
import "nprogress/nprogress.css";

import "./tailwind.css";
import 'react-photo-view/dist/react-photo-view.css';
import "@/translations/i18n"
import { clientOnly } from "vike-react/clientOnly";
import 'radar-sdk-js/dist/radar.css';
const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));
import { Toaster } from "@/components/ui/sonner"
import { SystemErrorOverlay } from "@/features/system-errors/SystemErrorOverlay";
const UpgradeModal = clientOnly(() => import("@/components/subscriptions/UpgradeModal"));
const DinerModeWatcher = clientOnly(() => import("@/components/diner-mode/DinerModeWatcher"));
const ClockedInBanner = clientOnly(() => import("@/components/shift-tracking/ClockedInBanner"));
const TourProvider = clientOnly(() => import("@/features/tour/components/TourProvider").then(m => ({ default: m.TourProvider })));
const CookieConsentBanner = clientOnly(() => import("@/components/shared/CookieConsentBanner"));

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider
        defaultTheme="light"
        storageKey="vite-ui-theme"

      >
        {children}
        <DinerModeWatcher />
        <ClockedInBanner />
        <Toaster />
        <UpgradeModal />
        <SystemErrorOverlay />
        <TourProvider />
        <CookieConsentBanner />
      </ThemeProvider>
    </>
  );
}


