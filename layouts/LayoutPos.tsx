import "./style.css";
import "./tailwind.css";
import "@/translations/i18n"
import { ClientOnly } from "vike-react/ClientOnly";
import ThemeProvider from "@/components/shared/theme-provider";
import TextSizeProvider from "@/components/shared/text-size-provider";
import { Toaster } from "@/components/ui/sonner"

export default function LayoutPos({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
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
    </ClientOnly>
  );
}
