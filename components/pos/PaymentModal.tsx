import React from 'react';
import { 
  Dialog as ShadcnDialog, 
  DialogContent as ShadcnDialogContent, 
  DialogHeader as ShadcnDialogHeader, 
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer, ArrowRight } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  method: 'cash' | 'card' | null;
}

export function PaymentModal({ isOpen, onClose, total, method }: PaymentModalProps) {
  return (
    <ShadcnDialog open={isOpen} onOpenChange={onClose}>
      <ShadcnDialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <ShadcnDialogHeader className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <ShadcnDialogTitle className="text-2xl font-bold">Payment Successful</ShadcnDialogTitle>
          <p className="text-slate-400 text-center">
            Order has been processed successfully via {method?.toUpperCase()}
          </p>
        </ShadcnDialogHeader>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 my-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Total Charged</span>
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Transaction ID</span>
            <span className="font-mono text-xs">#PX-88992-K</span>
          </div>
        </div>

        <ShadcnDialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 gap-2 border-slate-700" onClick={onClose}>
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Button className="flex-1 gap-2" onClick={onClose}>
            New Order
            <ArrowRight className="h-4 w-4" />
          </Button>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}
