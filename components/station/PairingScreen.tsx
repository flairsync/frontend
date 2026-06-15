import { useState } from "react";
import { getOrCreateDeviceUuid, saveStationToken } from "@/features/station/useStationAuth";
import { publicApi } from "@/features/station/station-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, ChefHat, Loader2, Unplug } from "lucide-react";

interface Props {
  stationType: "pos" | "kds";
  onLinked: () => void;
}

export default function PairingScreen({ stationType, onLinked }: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isReady = code.length === 8 && name.trim().length > 0;

  async function handleLink() {
    if (!isReady) return;
    setLoading(true);
    setError("");

    try {
      const res = await publicApi.post("/station/link", {
        deviceUuid: getOrCreateDeviceUuid(),
        code: code.toUpperCase(),
        name: name.trim(),
        type: stationType,
      });
      saveStationToken(res.data.data.token);
      onLinked();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(val: string) {
    const sanitized = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitized.length <= 8) setCode(sanitized);
  }

  const Icon = stationType === "kds" ? ChefHat : Monitor;
  const label = stationType === "kds" ? "Kitchen Display (KDS)" : "POS Terminal";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-primary/20">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Link this device</h1>
          <p className="text-slate-400 text-sm mt-2">
            Ask the business owner to generate a pairing code from the dashboard.
          </p>
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <div className={`w-1.5 h-1.5 rounded-full ${stationType === 'kds' ? 'bg-amber-500' : 'bg-primary'}`} />
            {label}
          </span>
        </div>

        {/* Form */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Station Name
              </Label>
              <Input
                placeholder="e.g. Main Bar Terminal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Pairing Code
              </Label>
              <Input
                placeholder="8-character code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                maxLength={8}
                className="bg-slate-950 border-slate-800 text-center text-2xl tracking-[0.4em] font-mono uppercase text-slate-100 placeholder:text-slate-700 placeholder:tracking-normal placeholder:text-base placeholder:font-sans focus-visible:ring-primary/50 h-14"
              />
              <div className="flex justify-center gap-1.5 mt-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i < code.length ? "bg-primary" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center font-bold bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              onClick={handleLink}
              disabled={loading || !isReady}
              className="h-12 font-black text-xs uppercase tracking-widest gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Unplug className="w-4 h-4" />
                  Link Device
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Device ID footer */}
        <p className="text-center text-slate-700 text-[10px] font-mono">
          Device ID: {getOrCreateDeviceUuid().slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
