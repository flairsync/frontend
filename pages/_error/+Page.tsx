import { usePageContext } from "vike-react/usePageContext";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Home, Search, Mail, AlertCircle } from "lucide-react";

export default function Page() {
  const { is404 } = usePageContext();
  if (is404) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Illustration / left column */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
              <div className="inline-flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-2xl p-6 shadow-lg">
                <AlertCircle className="w-12 h-12" />
              </div>


              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">Page not found</h1>
                <p className="mt-3 text-slate-600 max-w-xl">We can’t find the page you’re looking for. It may have been moved, renamed, or might never have existed.</p>
              </div>


              <div className="w-full md:w-[420px]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Quick search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input placeholder="Search pages, staff, or settings..." />
                      <Button variant="secondary">Search</Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-col gap-2">
                      <a href="/">
                        <Button variant="ghost" className="justify-start">
                          <Home className="w-4 h-4 mr-2" />
                          Go to dashboard
                        </Button>
                      </a>


                      <a href="/support">
                        <Button variant="ghost" className="justify-start">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact support
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>


              <p className="text-sm text-slate-500 mt-2">If you think this is an error, please <a href="/support" className="text-indigo-600 hover:underline">report it</a> — we’ll investigate.</p>
            </div>


            {/* Right column - decorative panel */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold">Lost in the kitchen?</h3>
                    <p className="mt-1 text-sm text-slate-500">Try one of the links below or return to the main dashboard.</p>
                  </div>
                </div>


                <div className="mt-6 grid gap-4">
                  <a href="/staff">
                    <Button variant="outline" className="w-full justify-start">Staff Management</Button>
                  </a>
                  <a href="/schedules">
                    <Button variant="outline" className="w-full justify-start">Schedule Management</Button>
                  </a>
                  <a href="/settings">
                    <Button variant="outline" className="w-full justify-start">Settings</Button>
                  </a>
                </div>


                <div className="mt-6 text-xs text-slate-400">Error code: <span className="font-mono text-slate-600">404</span></div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <h1>500 Internal Server Error</h1>
      <p>Something went wrong.</p>
    </>
  );
}
