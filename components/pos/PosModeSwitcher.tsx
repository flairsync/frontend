import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Monitor, ChefHat, Layout } from 'lucide-react';

interface PosModeSwitcherProps {
  currentMode: 'terminal' | 'kds';
}

export function PosModeSwitcher({ currentMode }: PosModeSwitcherProps) {
  const modes = [
    { id: 'terminal', label: 'POS Terminal', icon: <Monitor className="w-4 h-4" />, href: '/pos/terminal' },
    { id: 'kds', label: 'Kitchen Display (KDS)', icon: <ChefHat className="w-4 h-4" />, href: '/pos/kds' },
  ];

  const activeMode = modes.find(m => m.id === currentMode) || modes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200 gap-3 px-4 rounded-xl shadow-inner active:scale-95 transition-all">
            <div className={`w-2 h-2 rounded-full animate-pulse ${currentMode === 'terminal' ? 'bg-primary' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-black tracking-widest uppercase">{activeMode.label}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200" align="start">
        <DropdownMenuLabel className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">
            Switch Device Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        {modes.map(mode => (
          <DropdownMenuItem 
            key={mode.id} 
            className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
                currentMode === mode.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800'
            }`}
            onClick={() => window.location.href = mode.href}
          >
            <div className={`p-1.5 rounded-lg ${currentMode === mode.id ? 'bg-primary/20 text-primary' : 'bg-slate-950 text-slate-500'}`}>
                {mode.icon}
            </div>
            <span className="text-xs font-bold">{mode.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors" disabled>
            <Layout className="w-4 h-4" />
            <span className="text-xs font-bold italic opacity-50">Split Mode (Coming Soon)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
