import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ValidationAlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  isVisible: boolean;
}

export function ValidationAlert({ type, message, isVisible }: ValidationAlertProps) {
  if (!isVisible) return null;

  const styles = {
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };

  const icons = {
    error: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-medium animate-in fade-in slide-in-from-top-1 ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
