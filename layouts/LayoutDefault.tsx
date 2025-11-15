import "./style.css";

import "./tailwind.css";

import "@/translations/i18n"
import { clientOnly } from "vike-react/clientOnly";

const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));
import { Toaster } from "@/components/ui/sonner"

console.log("DEFAULT LAYOUT ---------------------");

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


