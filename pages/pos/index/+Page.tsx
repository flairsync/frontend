import React, { useState, useEffect } from 'react';
import { Keypad } from '@/components/pos/Keypad';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function posLoginPage() {
  const [pin, setPin] = useState('');

  const handleInput = (value: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + value);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleLogin = (currentPin?: string) => {
    const pinToVerify = currentPin || pin;
    if (pinToVerify === '1234') { // Mock PIN
      window.location.href = '/pos/terminal';
    } else {
      alert('Invalid PIN (Try 1234)');
      setPin('');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleLogin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  // Auto-login when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        handleLogin(pin);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">pos Terminal Login</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your 4-digit staff PIN to unlock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 border-primary transition-colors ${
                  pin.length > i ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          <Keypad 
            onInput={handleInput} 
            onDelete={handleDelete} 
            onClear={handleClear} 
            onAction={pin.length === 4 ? handleLogin : undefined}
            actionLabel="Unlock Terminal"
          />
          
          <div className="text-center text-xs text-slate-500 mt-4">
            Demo PIN: 1234
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
