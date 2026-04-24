import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, CreditCard, Banknote, Utensils, Package, MapPin, Send, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ValidationAlert } from './ValidationAlert';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderCartProps {
  items: CartItem[];
  orderMode: 'dine-in' | 'takeaway';
  selectedTable?: string;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onPayment: (method: 'cash' | 'card') => void;
  onConfirm: () => void;
  onChangeMode: (mode: 'dine-in' | 'takeaway') => void;
  onChangeTable: () => void;
}

export function OrderCart({ 
    items, 
    orderMode,
    selectedTable,
    onUpdateQuantity, 
    onRemoveItem, 
    onClear, 
    onPayment, 
    onConfirm,
    onChangeMode,
    onChangeTable
}: OrderCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; 
  const total = subtotal + tax;

  const isDineInMissingTable = orderMode === 'dine-in' && !selectedTable;
  const isCartEmpty = items.length === 0;

  // Smart Button Logic
  const getMainAction = () => {
    if (isCartEmpty) return { label: 'Cart is Empty', disabled: true, icon: <AlertCircle className="w-4 h-4" /> };
    if (isDineInMissingTable) return { label: 'Select a Table', disabled: false, icon: <MapPin className="w-4 h-4" />, highlight: true };
    return { label: 'Confirm and Send', disabled: false, icon: <Send className="w-4 h-4" />, variant: 'default' };
  };

  const action = getMainAction();

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 overflow-hidden shadow-2xl">
      {/* Header Context */}
      <div className="p-6 border-b border-slate-800 space-y-5 bg-slate-900/50">
        <div className="flex justify-between items-center">
            <div className="space-y-0.5">
                <h2 className="text-xl font-black text-white tracking-tight">Active Order</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operator: John D.</p>
            </div>
            {!isCartEmpty && (
                <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:bg-destructive/10 h-8 font-black text-[10px] uppercase tracking-widest">
                    Discard
                </Button>
            )}
        </div>

        <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button 
                onClick={() => onChangeMode('dine-in')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    orderMode === 'dine-in' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-slate-500 hover:text-slate-200'
                }`}
            >
                <Utensils className="w-3.5 h-3.5" />
                Dine-In
            </button>
            <button 
                onClick={() => onChangeMode('takeaway')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    orderMode === 'takeaway' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-slate-500 hover:text-slate-200'
                }`}
            >
                <Package className="w-3.5 h-3.5" />
                Takeaway
            </button>
        </div>

        {orderMode === 'dine-in' && (
            <div 
                onClick={onChangeTable}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedTable 
                    ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                    : 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10 border-dashed animate-pulse'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedTable ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">Location</p>
                        <p className={`text-sm font-black ${selectedTable ? 'text-primary' : 'text-destructive italic underline decoration-wavy underline-offset-4'}`}>
                            {selectedTable || 'Assign a Table'}
                        </p>
                    </div>
                </div>
                {selectedTable && <span className="text-[10px] font-black text-primary/60 uppercase">Change</span>}
            </div>
        )}
      </div>

      {/* Cart Content */}
      <ScrollArea className="flex-1 p-6">
        {isCartEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-700">
            <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mb-4 border border-slate-900">
                <Package className="w-8 h-8 opacity-10" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">Terminal Empty</p>
            <p className="text-[10px] mt-1 italic">Add items to begin order</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4 p-3 rounded-2xl bg-slate-950/30 border border-slate-900 hover:border-slate-800 transition-colors group">
                <div className="flex-1">
                  <h4 className="font-black text-xs text-white uppercase tracking-tight">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold">${item.price.toFixed(2)} / unit</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-90"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-5 text-center font-black text-xs text-primary">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-90"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 ml-1"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Guide Banner */}
      <div className="px-6 py-2">
        <ValidationAlert 
            type={isDineInMissingTable ? "error" : "info"} 
            message={isDineInMissingTable ? "A table assignment is required to continue." : "Items ready for kitchen transmission."} 
            isVisible={!isCartEmpty} 
        />
      </div>

      {/* Settlement Area */}
      <div className="p-6 bg-slate-950 space-y-5 border-t border-slate-800">
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Gov. Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-black text-white uppercase tracking-tighter">Total Amount</span>
                <span className="text-3xl font-black text-primary">${total.toFixed(2)}</span>
            </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
            <Button 
                onClick={action.highlight ? onChangeTable : onConfirm}
                disabled={action.disabled}
                className={`w-full h-16 font-black text-sm gap-3 rounded-2xl shadow-xl transition-all active:scale-[0.98] ${
                    action.highlight ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 animate-pulse' : ''
                }`}
            >
                {action.icon}
                {action.label.toUpperCase()}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
                <Button 
                    variant="outline"
                    className="h-14 flex flex-col items-center justify-center gap-1 border-slate-800 bg-slate-900 font-black hover:bg-slate-800 rounded-2xl active:scale-95 transition-all text-[9px] tracking-widest"
                    disabled={isCartEmpty || isDineInMissingTable}
                    onClick={() => onPayment('cash')}
                >
                    <Banknote className="h-4 w-4 text-slate-400" />
                    CASH SETTLE
                </Button>
                <Button 
                    variant="outline"
                    className="h-14 flex flex-col items-center justify-center gap-1 border-slate-800 bg-slate-900 font-black hover:bg-slate-800 rounded-2xl active:scale-95 transition-all text-[9px] tracking-widest"
                    disabled={isCartEmpty || isDineInMissingTable}
                    onClick={() => onPayment('card')}
                >
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    CARD SETTLE
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
