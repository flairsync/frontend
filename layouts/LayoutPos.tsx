import "./style.css";
import "./tailwind.css";
import "@/translations/i18n"
import { clientOnly } from "vike-react/clientOnly";
import { useEffect } from "react";
const ThemeProvider = clientOnly(() => import("@/components/shared/theme-provider"));
import { Toaster } from "@/components/ui/sonner"

export default function LayoutPos({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('pos-active-theme');
    if (savedTheme) {
      document.body.className = `pos-theme-${savedTheme}`;
    }
  }, []);

  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="pos-ui-theme"
    >
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        {/* We'll handle the TOP NAV inside the Page components for tighter state integration, 
            or we could put a global header here if needed. 
            For now, let's just ensure the container is solid. */}
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </div>
      <Toaster />
      
      {/* Dynamic Theme Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --pos-primary: var(--primary);
        }
        .pos-theme-emerald { --primary: 142.1 70.6% 45.3%; --primary-foreground: 144.9 80.4% 10%; }
        .pos-theme-rose { --primary: 346.8 77.2% 49.8%; --primary-foreground: 355.7 100% 97.3%; }
        .pos-theme-amber { --primary: 37.9 92.1% 50.2%; --primary-foreground: 38 92% 5%; }
        .pos-theme-blue { --primary: 221.2 83.2% 53.3%; --primary-foreground: 210 40% 98%; }
      `}} />
    </ThemeProvider>
  );
}
