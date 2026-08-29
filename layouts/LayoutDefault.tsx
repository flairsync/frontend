import "./style.css";
import "nprogress/nprogress.css";

import "./tailwind.css";
import 'react-photo-view/dist/react-photo-view.css';
import "@/translations/i18n"
import { clientOnly } from "vike-react/clientOnly";
const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));
const TextSizeProvider = clientOnly(() => import("@/components/shared/text-size-provider"));
import { Toaster } from "@/components/ui/sonner"
import { SystemErrorOverlay } from "@/features/system-errors/SystemErrorOverlay";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
const UpgradeModal = clientOnly(() => import("@/components/subscriptions/UpgradeModal"));
const DinerModeWatcher = clientOnly(() => import("@/components/diner-mode/DinerModeWatcher"));
const ClockedInBanner = clientOnly(() => import("@/components/shift-tracking/ClockedInBanner"));
const TourProvider = clientOnly(() => import("@/features/tour/components/TourProvider").then(m => ({ default: m.TourProvider })));
const CookieConsentBanner = clientOnly(() => import("@/components/shared/CookieConsentBanner"));
const BetaModeBanner = clientOnly(() => import("@/components/shared/BetaModeBanner"));
const PasswordBreachBanner = clientOnly(() => import("@/components/shared/PasswordBreachBanner"));

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider
        defaultTheme="light"
        storageKey="vite-ui-theme"

      >
        <TextSizeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <DinerModeWatcher />
          <ClockedInBanner />
          <Toaster />
          <UpgradeModal />
          <SystemErrorOverlay />
          <TourProvider />
          <CookieConsentBanner />
          <BetaModeBanner />
          <PasswordBreachBanner />
        </TextSizeProvider>
      </ThemeProvider>
    </>
  );
}


