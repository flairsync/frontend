import "./style.css";

import "./tailwind.css";
import 'react-photo-view/dist/react-photo-view.css';
import "@/translations/i18n"
import { clientOnly } from "vike-react/clientOnly";
import 'radar-sdk-js/dist/radar.css';
const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));
import { Toaster } from "@/components/ui/sonner"

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider
        defaultTheme="light"
        storageKey="vite-ui-theme"

      >
        {children}
        <Toaster />
      </ThemeProvider>
    </>
  );
}


