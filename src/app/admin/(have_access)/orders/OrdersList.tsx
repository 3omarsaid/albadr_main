'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Eye, Phone, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminOrder, STATUS_MAP, OrderStatus } from '@/types';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { useAdminStore } from '@/stores/adminStore';

export default function OrdersList({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const { liveOrders, setLiveOrders, updateLiveOrder } = useAdminStore();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Seed the Zustand store with server-fetched initial data on first mount
  useEffect(() => {
    setLiveOrders(initialOrders);
  }, [initialOrders, setLiveOrders]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'ALL') return liveOrders;
    return liveOrders.filter(o => o.status === filterStatus);
  }, [liveOrders, filterStatus]);

  // When an order is updated via the details dialog, patch it in the store
  const handleOrderUpdated = (updatedOrder: AdminOrder) => {
    updateLiveOrder(updatedOrder.id, updatedOrder);
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  };

  const openOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">مباشر</span>
        </div>

        <Select 
          value={filterStatus} 
          onValueChange={(val) => setFilterStatus(val as OrderStatus | 'ALL')}
        >
          <SelectTrigger className="w-full sm:w-56 bg-white border-zinc-200/50 rounded-2xl h-12 shadow-sm font-bold text-zinc-700 focus:ring-emerald-500/20" dir="rtl">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-100 shadow-xl" dir="rtl">
            <SelectItem value="ALL" className="font-bold py-3 cursor-pointer">جميع الحالات</SelectItem>
            {Object.entries(STATUS_MAP).map(([key, value]) => (
              <SelectItem key={key} value={key} className="font-bold py-3 cursor-pointer">
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Mobile Card List (visible on small screens) ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-zinc-400 font-medium border border-zinc-100">
            لا توجد طلبات تطابق الفلتر الحالي
          </div>
        ) : filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-emerald-900 text-lg">{order.orderNumber}</p>
                <p className="font-bold text-zinc-700 text-sm mt-0.5">{order.customer.name}</p>
                <p className="text-xs text-zinc-400 flex items-center gap-1 font-mono mt-0.5">
                  {order.customer.phoneNumber}
                  <Phone className="w-3 h-3" />
                </p>
              </div>
              <span className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shrink-0",
                STATUS_MAP[order.status as keyof typeof STATUS_MAP].color
              )}>
                {STATUS_MAP[order.status as keyof typeof STATUS_MAP].label}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
              <div>
                <p className="font-black text-emerald-700 text-lg">
                  {order.totalPrice.toLocaleString()} <span className="text-xs text-emerald-600/70">ج.م</span>
                </p>
                <p className="text-zinc-400 text-xs font-medium">
                  {format(new Date(order.createdAt), 'dd MMMM yyyy | HH:mm', { locale: ar })}
                </p>
              </div>
              <Button 
                onClick={() => openOrderDetails(order)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
              >
                <Eye className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table (hidden on small screens) ── */}
      <div className="hidden md:block bg-white rounded-[32px] shadow-sm overflow-hidden border border-zinc-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 border-b-zinc-100">
                <TableHead className="text-right px-8 font-bold py-5 text-zinc-500 w-[120px]">رقم الطلب</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 w-[200px]">العميل</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 w-[180px]">التاريخ</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 w-[150px]">المبلغ</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 w-[150px]">الحالة</TableHead>
                <TableHead className="text-right px-8 font-bold text-zinc-500 w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-zinc-400 font-medium">
                    لا توجد طلبات تطابق الفلتر الحالي
                  </TableCell>
                </TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-zinc-50/50 transition-colors border-b-zinc-50 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <TableCell className="px-8 font-black text-emerald-900">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-zinc-700">{order.customer.name}</span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                        {order.customer.phoneNumber}
                        <Phone className="w-3 h-3" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm font-medium">
                    {format(new Date(order.createdAt), 'dd MMMM yyyy | HH:mm', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-black text-emerald-700 text-lg">
                    {order.totalPrice.toLocaleString()} <span className="text-xs text-emerald-600/70">ج.م</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-sm",
                      STATUS_MAP[order.status as keyof typeof STATUS_MAP].color
                    )}>
                      {STATUS_MAP[order.status as keyof typeof STATUS_MAP].label}
                    </span>
                  </TableCell>
                  <TableCell className="px-8">
                    <Button 
                      onClick={() => openOrderDetails(order)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <OrderDetailsDialog 
        order={selectedOrder} 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
