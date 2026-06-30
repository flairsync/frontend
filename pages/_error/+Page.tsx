import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home, Rss, LayoutDashboard, AlertCircle } from "lucide-react";

export default function Page() {
  const { is404 } = usePageContext();
  const { t } = useTranslation();

  if (is404) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
        <div className="flex flex-col items-center text-center gap-8 max-w-md w-full">
          <div className="inline-flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-2xl p-6 shadow-lg">
            <AlertCircle className="w-12 h-12" />
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
              {t("errors.404.title")}
            </h1>
            <p className="mt-3 text-slate-600">
              {t("errors.404.description")}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <a href="/">
              <Button variant="default" className="w-full gap-2">
                <Home className="w-4 h-4" />
                {t("errors.404.goHome")}
              </Button>
            </a>
            <a href="/feed">
              <Button variant="outline" className="w-full gap-2">
                <Rss className="w-4 h-4" />
                {t("errors.404.goToFeed")}
              </Button>
            </a>
            <a href="/manage">
              <Button variant="outline" className="w-full gap-2">
                <LayoutDashboard className="w-4 h-4" />
                {t("errors.404.goToHub")}
              </Button>
            </a>
          </div>

          <p className="text-xs text-slate-400">
            {t("errors.404.errorCode")}{" "}
            <span className="font-mono text-slate-600">404</span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <h1>{t("errors.500.title")}</h1>
      <p>{t("errors.500.description")}</p>
    </>
  );
}
