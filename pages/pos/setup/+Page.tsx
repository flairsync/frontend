import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Keypad } from '@/components/pos/Keypad';
import { Monitor, Smartphone, CheckCircle2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function posSetupPage() {
  const [pairingCode, setPairingCode] = useState('');
  const [isPaired, setIsPaired] = useState(false);

  const handleInput = (val: string) => {
    if (pairingCode.length < 6) setPairingCode(prev => prev + val);
  };

  const handleDelete = () => setPairingCode(prev => prev.slice(0, -1));
  const handleClear = () => setPairingCode('');

  const handlePair = () => {
    if (pairingCode.length === 6) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Pairing with Business...',
          success: () => {
            setIsPaired(true);
            return 'Terminal paired successfully!';
          },
          error: 'Failed to pair terminal.',
        }
      );
    }
  };

  if (isPaired) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <Card className="w-full max-w-md border-green-500/50 bg-slate-900">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Ready to Go!</h2>
              <p className="text-slate-400">Terminal "Main Bar #1" is now active.</p>
            </div>
            <Button className="w-full h-12" onClick={() => window.location.href = '/pos'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 bg-slate-950 gap-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Pair Terminal</h1>
          <p className="text-slate-400">Enter the 6-digit pairing code from your business dashboard.</p>
        </div>

        <Card className="border-slate-800 bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-800/50">
            <div className="flex justify-center gap-2">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-12 rounded-md border-2 border-slate-700 flex items-center justify-center text-xl font-bold transition-all ${
                    pairingCode.length > i ? 'border-primary bg-primary/10 text-primary' : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  {pairingCode[i] || ''}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Keypad 
              onInput={handleInput} 
              onDelete={handleDelete} 
              onClear={handleClear}
              onAction={pairingCode.length === 6 ? handlePair : undefined}
              actionLabel="Pair Device"
            />
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col items-center gap-6 max-w-xs text-center">
        <div className="p-8 bg-white rounded-3xl shadow-2xl">
          <QrCode className="w-48 h-48 text-black" />
        </div>
        <div className="space-y-2">
          <p className="text-slate-100 font-semibold">Or Scan QR Code</p>
          <p className="text-slate-400 text-sm">Scan this code with your administrator app to pair instantly.</p>
        </div>
      </div>
    </div>
  );
}
