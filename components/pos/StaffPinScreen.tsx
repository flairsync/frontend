import { useState, useEffect } from "react";
import { stationApi } from "@/features/station/station-api";
import { useStaffSession } from "@/features/pos/useStaffSession";
import { Lock } from "lucide-react";

interface Props {
    businessId: string;
    onLogin: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function StaffPinScreen({ businessId, onLogin }: Props) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const { setSession } = useStaffSession();

    useEffect(() => {
        if (pin.length === 4) handleLogin(pin);
    }, [pin]);

    function pressKey(key: string) {
        if (loading) return;
        if (key === "⌫") {
            setPin((p) => p.slice(0, -1));
            setError("");
        } else if (pin.length < 4) {
            setPin((p) => p + key);
        }
    }

    async function handleLogin(enteredPin: string) {
        setLoading(true);
        setError("");
        try {
            const res = await stationApi.post("/station/staff/pin-login", {
                pin: enteredPin,
                businessId,
            });
            const { employmentId, name, roles, shortToken } = res.data.data;
            setSession({ employmentId, name, roles, shortToken, loggedInAt: new Date() });
            onLogin();
        } catch {
            setError("Invalid PIN");
            setPin("");
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-background text-foreground select-none">
            <div className="flex flex-col items-center gap-6 w-72">
                {/* Icon + title */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold">Staff Login</h1>
                        <p className="text-sm text-muted-foreground mt-1">Enter your 4-digit PIN</p>
                    </div>
                </div>

                {/* PIN dots */}
                <div className={`flex gap-4 ${shake ? "animate-shake" : ""}`}>
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                                pin.length > i
                                    ? "bg-primary border-primary scale-110"
                                    : "bg-transparent border-muted-foreground/30"
                            }`}
                        />
                    ))}
                </div>

                {/* Error / spacer */}
                <div className="h-4 flex items-center">
                    {error && (
                        <p className="text-destructive text-sm font-medium">{error}</p>
                    )}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-2 w-full">
                    {KEYS.map((key, idx) => (
                        <button
                            key={idx}
                            onClick={() => key && pressKey(key)}
                            disabled={!key || loading}
                            className={`h-14 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                                key
                                    ? "bg-card hover:bg-muted border border-border text-foreground cursor-pointer"
                                    : "invisible"
                            } ${key === "⌫" ? "text-muted-foreground" : ""}`}
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {loading && (
                    <p className="text-muted-foreground text-sm animate-pulse">Verifying...</p>
                )}
            </div>
        </div>
    );
}
