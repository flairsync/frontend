import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowLeft, Clock, CheckCircle2, XCircle, Printer, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_ORDERS = [
  { id: 'ORD-001', time: '10 mins ago', total: 24.50, status: 'completed', items: 3, dishes: 'Espresso, Cappuccino, Pizza' },
  { id: 'ORD-002', time: '15 mins ago', total: 12.00, status: 'pending', items: 1, dishes: 'Margarita Pizza' },
  { id: 'ORD-003', time: '22 mins ago', total: 45.80, status: 'completed', items: 5, dishes: 'Craft Beer, Burger, Fries' },
  { id: 'ORD-004', time: '1 hour ago', total: 8.50, status: 'cancelled', items: 2, dishes: 'Orange Juice, Cake' },
  { id: 'ORD-005', time: '2 hours ago', total: 120.00, status: 'completed', items: 12, dishes: 'Big Party Mix' },
];

export default function posOrdersPage() {
  const [search, setSearch] = useState('');

  const filteredOrders = MOCK_ORDERS.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.dishes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      <header className="h-20 border-b border-slate-800 flex items-center px-6 gap-6 bg-slate-900/50">
        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/pos/terminal'}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-100">Order History</h1>
        
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search orders or items..." 
            className="pl-10 bg-slate-900 border-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Ongoing</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Completed Today</p>
                <p className="text-xl font-bold">84</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Cancelled</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-primary">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Revenue</p>
                <p className="text-xl font-bold">$1,245.50</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 bg-slate-900 border-slate-800 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader className="bg-slate-800/50 sticky top-0">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Order ID</TableHead>
                  <TableHead className="text-slate-400">Time</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400 text-right">Total</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-mono font-bold">{order.id}</TableCell>
                    <TableCell className="text-slate-400">{order.time}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.dishes}</TableCell>
                    <TableCell className="text-right font-bold">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={
                          order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          order.status === 'pending' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-red-500/10 text-red-500'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
}
