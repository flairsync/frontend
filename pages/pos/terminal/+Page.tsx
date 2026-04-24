import React, { useState, useMemo } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';
import { OrderCart, CartItem } from '@/components/pos/OrderCart';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ConfirmationModal } from '@/components/pos/ConfirmationModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, Coffee, Pizza, Cake, Beer, ArrowLeft, LogOut, 
  ClipboardList, Package, LayoutGrid, Settings as SettingsIcon,
  User, CheckCircle2, MapPin, Utensils, CreditCard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PosModeSwitcher } from '@/components/pos/PosModeSwitcher';

// Mock Data
const CATEGORIES = [
  { id: 'all', name: 'All', icon: <Search className="w-4 h-4" /> },
  { id: 'hot-drinks', name: 'Drinks', icon: <Coffee className="w-4 h-4" /> },
  { id: 'food', name: 'Food', icon: <Pizza className="w-4 h-4" /> },
  { id: 'desserts', name: 'Sweets', icon: <Cake className="w-4 h-4" /> },
];

const TABLES = [
  { id: 't1', name: 'Table 1', zone: 'Indoor' },
  { id: 't2', name: 'Table 2', zone: 'Indoor' },
  { id: 't3', name: 'Table 3', zone: 'Terrace' },
  { id: 't4', name: 'Table 4', zone: 'Terrace' },
  { id: 't5', name: 'Table 5', zone: 'Bar' },
  { id: 't6', name: 'Table 6', zone: 'Bar' },
];

const TABLE_ZONES = ['All Zones', 'Indoor', 'Terrace', 'Bar'];

const MOCK_PRODUCTS = [
    { id: '1', name: 'Espresso', price: 2.5, category: 'hot-drinks', color: '#3d2b1f' },
    { id: '2', name: 'Cappuccino', price: 3.5, category: 'hot-drinks', color: '#c3a17e' },
    { id: '3', name: 'Latte', price: 3.8, category: 'hot-drinks', color: '#e6d5b8' },
    { id: '4', name: 'Margarita Pizza', price: 12.0, category: 'food', color: '#e23636' },
    { id: '5', name: 'Pepperoni Pizza', price: 14.0, category: 'food', color: '#c41a1a' },
    { id: '6', name: 'Cheeseburger', price: 10.5, category: 'food', color: '#f2a65a' },
];

interface OpenOrder {
  id: string;
  tableName?: string;
  mode: 'dine-in' | 'takeaway';
  items: CartItem[];
  total: number;
  time: string;
  status: 'ordered' | 'paid';
}

export default function posTerminalPage() {
  const [activeMainSection, setActiveMainSection] = useState<'menu' | 'orders' | 'tables'>('menu');
  const [orderMode, setOrderMode] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  
  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean,
    title: string,
    description: string,
    onConfirm: () => void,
    variant?: 'default' | 'destructive'
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const selectedTableName = useMemo(() => 
    TABLES.find(t => t.id === selectedTableId)?.name, 
  [selectedTableId]);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal + (subtotal * 0.1);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredTables = useMemo(() => {
    return TABLES.filter(t => selectedZone === 'All Zones' || t.zone === selectedZone);
  }, [selectedZone]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleTableSelect = (tableId: string) => {
    const table = TABLES.find(t => t.id === tableId);
    const existingOrder = openOrders.find(o => o.tableName === table?.name);
    
    if (existingOrder) {
        setConfirmModal({
            isOpen: true,
            title: `Table ${table?.name} is Occupied`,
            description: `This table already has an active order ($${existingOrder.total.toFixed(2)}). Would you like to load and edit it?`,
            onConfirm: () => loadOrder(existingOrder),
        });
        return;
    }

    setSelectedTableId(tableId);
    setOrderMode('dine-in');
    setActiveMainSection('menu');
    toast.info(`Table ${table?.name} assigned to cart`);
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    if (orderMode === 'dine-in' && !selectedTableId) {
        toast.error("Please select a table to continue");
        setActiveMainSection('tables');
        return;
    }

    const newOrder: OpenOrder = {
      id: `ord-${Date.now()}`,
      tableName: orderMode === 'dine-in' ? selectedTableName : 'Takeaway',
      mode: orderMode,
      items: [...cart],
      total: cartTotal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'ordered'
    };

    setOpenOrders(prev => [...prev, newOrder]);
    resetActiveOrder();
    toast.success("Order Sent Successfully!");
  };

  const loadOrder = (order: OpenOrder) => {
    setCart(order.items);
    setOrderMode(order.mode);
    if (order.mode === 'dine-in') {
        const table = TABLES.find(t => t.name === order.tableName);
        setSelectedTableId(table?.id || null);
    }
    setOpenOrders(prev => prev.filter(o => o.id !== order.id));
    setActiveMainSection('menu');
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setConfirmModal({
        isOpen: true,
        title: 'Clear Active Order?',
        description: 'This will remove all items from the current cart. This action cannot be undone.',
        variant: 'destructive',
        onConfirm: resetActiveOrder,
    });
  };

  const resetActiveOrder = () => {
    setCart([]);
    setSelectedTableId(null);
    setOrderMode('dine-in');
  };

  // Track which open order we are currently paying for (if any)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const handlePayment = (method: 'cash' | 'card', override?: { mode: 'dine-in' | 'takeaway', tableId: string | null, orderId?: string }) => {
    const mode = override?.mode ?? orderMode;
    const tableId = override?.tableId ?? selectedTableId;

    if (mode === 'dine-in' && !tableId) {
        toast.error("Please select a table for Dine-In orders");
        setActiveMainSection('tables');
        return;
    }
    
    if (override?.orderId) {
        setPayingOrderId(override.orderId);
    }
    
    setPaymentMethod(method);
    setIsPaymentModalOpen(true);
  };

  const finalizeOrder = () => {
    setIsPaymentModalOpen(false);
    
    // If we were paying for an existing open order, remove it now
    if (payingOrderId) {
        setOpenOrders(prev => prev.filter(o => o.id !== payingOrderId));
        setPayingOrderId(null);
    }
    
    resetActiveOrder();
    toast.success("Payment Received. Order Closed.");
  };

  const handleCancelOrder = (orderId: string) => {
    setConfirmModal({
        isOpen: true,
        title: 'Cancel Order?',
        description: 'Are you sure you want to completely remove this order? This action cannot be undone.',
        variant: 'destructive',
        onConfirm: () => setOpenOrders(prev => prev.filter(o => o.id !== orderId)),
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* TOP NAVIGATION */}
      <nav className="h-16 flex items-center px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-6 mr-12">
            <PosModeSwitcher currentMode="terminal" />
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl">
            {[
                { id: 'menu', label: 'MENU', icon: <Package className="w-4 h-4" /> },
                { id: 'orders', label: 'ORDERS', icon: <ClipboardList className="w-4 h-4" /> },
                { id: 'tables', label: 'TABLES', icon: <LayoutGrid className="w-4 h-4" /> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveMainSection(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-[10px] tracking-widest transition-all ${
                        activeMainSection === tab.id 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                >
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'orders' && openOrders.length > 0 && (
                        <span className="ml-1 w-4 h-4 bg-destructive text-white rounded-full text-[9px] flex items-center justify-center">
                            {openOrders.length}
                        </span>
                    )}
                </button>
            ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => window.location.href = '/pos/settings'}>
                <SettingsIcon className="w-5 h-5 text-slate-400" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-slate-800" />
            <div className="flex items-center gap-3 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-800">
                <div className="text-right flex flex-col leading-none">
                    <p className="text-[10px] font-black text-white">John Doe</p>
                    <p className="text-[8px] text-primary font-bold">MANAGER</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/20">
                    <User className="w-4 h-4" />
                </div>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-destructive" onClick={() => window.location.href = '/pos'}>
                <LogOut className="w-5 h-5" />
            </Button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* CONTEXTUAL LEFT SIDEBAR */}
        <aside className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col p-4 flex-shrink-0">
            <div className="mb-6">
                <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-1">
                    {activeMainSection === 'menu' ? 'Department' : 
                    activeMainSection === 'tables' ? 'Floor Zones' : 'Order List'}
                </p>
                <div className="h-0.5 w-6 bg-primary rounded-full" />
            </div>
            
            <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="flex flex-col gap-2">
                    {activeMainSection === 'menu' && CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center justify-between px-4 py-4 rounded-xl text-xs font-bold transition-all border ${
                                selectedCategory === cat.id 
                                ? 'bg-primary/20 text-primary border-primary/30 shadow-none' 
                                : 'text-slate-400 hover:bg-slate-800 border-transparent hover:text-slate-100'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                {cat.icon}
                                {cat.name}
                            </span>
                            {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                    ))}

                    {activeMainSection === 'tables' && TABLE_ZONES.map(zone => (
                        <button
                            key={zone}
                            onClick={() => setSelectedZone(zone)}
                            className={`flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-bold transition-all border ${
                                selectedZone === zone 
                                ? 'bg-primary/20 text-primary border-primary/30' 
                                : 'text-slate-400 hover:bg-slate-800 border-transparent hover:text-slate-100'
                            }`}
                        >
                            <MapPin className="w-4 h-4" />
                            {zone}
                        </button>
                    ))}

                    {activeMainSection === 'orders' && ['All Active', 'To Prepare', 'Completed'].map(filter => (
                        <button
                            key={filter}
                            className={`flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 border border-transparent`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            {filter}
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden relative">
            {activeMainSection === 'menu' && (
                <>
                    <div className="h-14 flex items-center px-6 gap-4 border-b border-slate-900 bg-slate-900/10 flex-shrink-0">
                        <Search className="h-4 w-4 text-slate-600" />
                        <Input 
                            placeholder="Enter product name or code..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus-visible:ring-0 text-xs p-0 h-auto placeholder:text-slate-700 font-medium"
                        />
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onClick={addToCart} />
                            ))}
                        </div>
                    </ScrollArea>
                </>
            )}

            {activeMainSection === 'orders' && (
                <div className="h-full p-8">
                    <div className="flex items-end gap-3 mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight">Active Orders</h2>
                        <span className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-widest">{openOrders.length} Total</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {openOrders.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-700 bg-slate-900/10 rounded-3xl border border-dashed border-slate-900">
                                <ClipboardList className="w-12 h-12 mb-4 opacity-10" />
                                <p className="font-bold uppercase tracking-widest text-xs">No active tabs found</p>
                            </div>
                        )}
                        {openOrders.map(order => (
                            <Card key={order.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-slate-700 transition-all">
                                <CardContent className="p-0">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${order.mode === 'dine-in' ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'}`}>
                                                    {order.mode === 'dine-in' ? <Utensils className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                </div>
                                                <h3 className="font-black text-lg">{order.tableName}</h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-2 py-0.5 rounded-full">{order.time}</span>
                                        </div>
                                        <div className="space-y-1 mb-6">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Total Due: ${order.total.toFixed(2)}</p>
                                            {order.items.slice(0, 2).map((it, idx) => (
                                                <p key={idx} className="text-xs text-slate-400">
                                                    {it.quantity}x {it.name}
                                                </p>
                                            ))}
                                            {order.items.length > 2 && <p className="text-[10px] text-slate-600 font-bold">+ {order.items.length - 2} more items</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <Button 
                                                className="bg-primary text-primary-foreground font-black text-[10px] h-10 gap-2 flex-1 outline-none" 
                                                onClick={() => {
                                                    // Quick Pay Logic with Override to skip state lag
                                                    const table = TABLES.find(t => t.name === order.tableName);
                                                    const tableId = table?.id || null;
                                                    
                                                    // Prep the cart first anyway (for display behind modal)
                                                    setCart(order.items);
                                                    setOrderMode(order.mode);
                                                    setSelectedTableId(tableId);

                                                    // Trigger payment with immediate values
                                                    handlePayment('card', { 
                                                        mode: order.mode, 
                                                        tableId, 
                                                        orderId: order.id 
                                                    });
                                                }}
                                            >
                                                <CreditCard className="w-3 h-3" />
                                                PAY NOW
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="border-slate-800 text-slate-300 font-black text-[10px] h-10 gap-2 flex-1 hover:bg-slate-800"
                                                onClick={() => loadOrder(order)}
                                            >
                                                <SettingsIcon className="w-3 h-3" />
                                                EDIT
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                className="col-span-2 text-destructive/40 hover:text-destructive hover:bg-destructive/10 font-bold text-[9px] h-8 uppercase tracking-widest mt-1"
                                                onClick={() => handleCancelOrder(order.id)}
                                            >
                                                Cancel & Void Order
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeMainSection === 'tables' && (
                <div className="h-full p-8">
                    <div className="flex items-end gap-3 mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight">Select a Table</h2>
                        <span className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-widest">{selectedZone}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {filteredTables.map(table => {
                            const hasOrder = openOrders.some(o => o.tableName === table.name);
                            const isActive = selectedTableId === table.id;
                            
                            return (
                                <div 
                                    key={table.id}
                                    onClick={() => handleTableSelect(table.id)}
                                    className={`relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 border-2 transition-all cursor-pointer ${
                                        isActive 
                                        ? 'bg-primary border-primary text-primary-foreground shadow-2xl scale-110 z-10' 
                                        : hasOrder
                                        ? 'bg-primary/5 border-primary/50 text-primary animate-pulse'
                                        : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-100 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className={`p-3 rounded-2xl ${isActive ? 'bg-black/10' : 'bg-slate-950/50'}`}>
                                        <LayoutGrid className={`w-8 h-8 ${isActive ? 'opacity-100' : 'opacity-20'}`} />
                                    </div>
                                    <div className="text-center">
                                        <span className="font-black text-sm block">{table.name}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-primary-foreground/70' : hasOrder ? 'text-primary' : 'text-slate-600'}`}>
                                            {isActive ? 'Current' : hasOrder ? 'In Use' : 'Vacant'}
                                        </span>
                                    </div>
                                    {hasOrder && !isActive && (
                                        <Badge className="absolute -top-2 -right-2 px-1.5 h-5 bg-primary text-primary-foreground font-black text-[9px]">ACTIVE</Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </main>

        {/* RIGHT SIDEBAR: CART */}
        <aside className="w-80 lg:w-96 flex flex-col h-full flex-shrink-0 border-l border-slate-900 bg-slate-900/20">
             <OrderCart 
                items={cart} 
                orderMode={orderMode}
                selectedTable={selectedTableName}
                onUpdateQuantity={(id, delta) => setCart(prev => prev.map(item => item.id === id ? {...item, quantity: Math.max(1, item.quantity + delta)} : item))}
                onRemoveItem={(id) => setCart(prev => prev.filter(item => item.id !== id))}
                onClear={handleClearCart}
                onPayment={handlePayment}
                onConfirm={handleConfirmOrder}
                onChangeMode={setOrderMode}
                onChangeTable={() => setActiveMainSection('tables')}
            />
        </aside>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={finalizeOrder} 
        total={cartTotal} 
        method={paymentMethod} 
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
      />
    </div>
  );
}
