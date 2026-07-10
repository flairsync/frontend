import "./style.css";
import "./tailwind.css";
import "@/translations/i18n"
import { clientOnly } from "vike-react/clientOnly";
const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));
const TextSizeProvider = clientOnly(() => import("@/components/shared/text-size-provider"));
import { Toaster } from "@/components/ui/sonner"

export default function LayoutPos({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme="light"
      storageKey="vite-ui-theme"
    >
      <TextSizeProvider>
        <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
          <main className="flex-1 flex flex-col min-h-0">
            {children}
          </main>
        </div>
        <Toaster />
      </TextSizeProvider>
    </ThemeProvider>
  );
}
