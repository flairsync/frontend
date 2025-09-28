import { usePageContext } from "vike-react/usePageContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Home, Search, Mail, AlertCircle } from "lucide-react";


import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { navigate } from "vike/client/router";
const pages = [
  {
    value: "/manage",
    label: "Manager",
  },
  {
    value: "/feed",
    label: "Feed",
  },
  {
    value: "/profile",
    label: "Profile",
  },
  {
    value: "/profile/settings",
    label: "Settings",
  },
  {
    value: "/",
    label: "Home",
  },
];




export default function Page() {
  const { is404 } = usePageContext();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false)

  if (is404) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Illustration / left column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <div className="inline-flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-2xl p-6 shadow-lg">
              <AlertCircle className="w-12 h-12" />
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
                {t("errors.404.title")}
              </h1>
              <p className="mt-3 text-slate-600 max-w-xl">
                {t("errors.404.description")}
              </p>
            </div>

            <div className="w-full md:w-[420px]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {t("errors.404.quickSearch")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {/*  <Input placeholder={t("errors.404.searchPlaceholder")} />
                    <Button variant="secondary">{t("errors.404.searchButton")}</Button> */}

                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[200px] justify-between"
                        >
                          {t("errors.404.searchPlaceholder")}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder={t("errors.404.searchPlaceholder")} className="h-9" />
                          <CommandList>
                            <CommandEmpty>...</CommandEmpty>
                            <CommandGroup>
                              {pages.map((page) => (
                                <CommandItem
                                  className="hover:cursor-pointer "
                                  key={page.value}
                                  value={page.value}
                                  onSelect={(currentValue) => {
                                    navigate(currentValue)
                                  }}
                                >
                                  {page.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    <a href="/">
                      <Button variant="ghost" className="justify-start">
                        <Home className="w-4 h-4 mr-2" />
                        {t("errors.404.goToDashboard")}
                      </Button>
                    </a>
                    <a href="/support">
                      <Button variant="ghost" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        {t("errors.404.contactSupport")}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              {t("errors.404.reportError")}
            </p>
          </div>

          {/* Right column - decorative panel */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{t("errors.404.lostTitle")}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("errors.404.lostDescription")}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <a href="/staff">
                  <Button variant="outline" className="w-full justify-start">
                    {t("errors.404.staffManagement")}
                  </Button>
                </a>
                <a href="/schedules">
                  <Button variant="outline" className="w-full justify-start">
                    {t("errors.404.scheduleManagement")}
                  </Button>
                </a>
                <a href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    {t("errors.404.settings")}
                  </Button>
                </a>
              </div>

              <div className="mt-6 text-xs text-slate-400">
                {t("errors.404.errorCode")}{" "}
                <span className="font-mono text-slate-600">404</span>
              </div>
            </div>
          </div>
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
