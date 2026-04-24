import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Palette, Globe, Monitor, Save, RotateCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const THEMES = [
  { id: 'blue', name: 'Classic Blue', class: 'pos-theme-blue', color: 'bg-blue-600' },
  { id: 'emerald', name: 'Emerald Green', class: 'pos-theme-emerald', color: 'bg-emerald-600' },
  { id: 'rose', name: 'Rose Petal', class: 'pos-theme-rose', color: 'bg-rose-600' },
  { id: 'amber', name: 'Amber Glow', class: 'pos-theme-amber', color: 'bg-amber-600' },
];

const LANGUAGES = [
  { id: 'en', name: 'English (US)' },
  { id: 'fr', name: 'French' },
  { id: 'es', name: 'Spanish' },
  { id: 'ar', name: 'Arabic' },
];

export default function POSSettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [selectedLang, setSelectedLang] = useState('en');
  const [terminalName, setTerminalName] = useState('Main Terminal #1');

  useEffect(() => {
    // Load from localStorage
    const savedTheme = localStorage.getItem('pos-active-theme');
    if (savedTheme) setSelectedTheme(savedTheme);
  }, []);

  const handleSave = () => {
    localStorage.setItem('pos-active-theme', selectedTheme);
    document.body.className = THEMES.find(t => t.id === selectedTheme)?.class || '';
    toast.success('Settings saved successfully!');
    setTimeout(() => {
        window.location.href = '/pos/terminal';
    }, 1000);
  };

  const handleReset = () => {
    setSelectedTheme('blue');
    setSelectedLang('en');
    setTerminalName('Main Terminal #1');
    toast.info('Settings reset to default');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/pos/terminal'}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-slate-100 tracking-tight">POS Configuration</h1>
                <p className="text-slate-400">Personalize your terminal appearance and behavior.</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Branding & Appearance */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Select a primary color for your terminal buttons and highlights.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                                        selectedTheme === theme.id 
                                        ? 'border-primary bg-primary/10' 
                                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full shadow-lg ${theme.color}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Regional
                        </CardTitle>
                        <CardDescription>Configure language and localization preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Language</Label>
                                <select 
                                    value={selectedLang}
                                    onChange={(e) => setSelectedLang(e.target.value)}
                                    className="w-full bg-slate-950 border-slate-800 rounded-md p-2 text-sm focus:ring-1 ring-primary outline-none"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Currency Symbol</Label>
                                <Input value="$" disabled className="bg-slate-950 border-slate-800" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Terminal Info */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Monitor className="h-4 w-4 text-primary" />
                            Terminal Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Terminal Name</Label>
                            <Input 
                                value={terminalName} 
                                onChange={(e) => setTerminalName(e.target.value)}
                                className="bg-slate-950 border-slate-800" 
                            />
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Hardware ID</p>
                            <p className="text-xs font-mono">B-992-X10-POS</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                    <Button className="h-12 gap-2" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                    <Button variant="outline" className="h-12 gap-2 border-slate-800" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                        Reset Defaults
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
