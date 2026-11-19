import "./style.css";
import "nprogress/nprogress.css";

import "./tailwind.css";
import 'react-photo-view/dist/react-photo-view.css';
import "@/translations/i18n"
import { ClientOnly } from "vike-react/ClientOnly";
import ThemeProvider from "@/components/shared/theme-provider";
import TextSizeProvider from "@/components/shared/text-size-provider";
// Deliberately NOT clientOnly: the management shells branch on uiMode during
// SSR, so this has to render on the server or every manage page flashes the
// wrong navigation before hydration.
import UiModeProvider from "@/components/shared/ui-mode-provider";
import { Toaster } from "@/components/ui/sonner"
import { SystemErrorOverlay } from "@/features/system-errors/SystemErrorOverlay";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import UpgradeModal from "@/components/subscriptions/UpgradeModal";
import DinerModeWatcher from "@/components/diner-mode/DinerModeWatcher";
import ClockedInBanner from "@/components/shift-tracking/ClockedInBanner";
import { TourProvider } from "@/features/tour/components/TourProvider";
import CookieConsentBanner from "@/components/shared/CookieConsentBanner";
import BetaModeBanner from "@/components/shared/BetaModeBanner";
import PasswordBreachBanner from "@/components/shared/PasswordBreachBanner";
import RadixPointerEventsGuard from "@/components/shared/RadixPointerEventsGuard";

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <UiModeProvider>
      <ClientOnly>
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
            <RadixPointerEventsGuard />
          </TextSizeProvider>
        </ThemeProvider>
      </ClientOnly>
    </UiModeProvider>
  );
}

