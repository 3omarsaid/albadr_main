'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminOrder, OrderStatus, STATUS_MAP } from '@/types';
import { MapPin, ShoppingBag, Phone, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateOrderStatus, updateOrderItemsPrices } from '@/actions/orderActions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  order: AdminOrder | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updatedOrder: AdminOrder) => void;
}

export function OrderDetailsDialog({ order, isOpen, onOpenChange, onOrderUpdated }: Props) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!order) return null;

  const hasUnpricedItems = order.items.some(item => item.priceAtPurchase === 0);

  const handlePriceChange = (itemId: string, val: string) => {
    setPrices(prev => ({ ...prev, [itemId]: val }));
  };

  const handleSavePrices = async () => {
    const itemsToUpdate = order.items
      .filter(item => item.priceAtPurchase === 0)
      .filter(item => prices[item.id] && !isNaN(Number(prices[item.id])))
      .map(item => ({
        id: item.id,
        newPrice: Number(prices[item.id])
      }));

    if (itemsToUpdate.length === 0) {
      toast.error("الرجاء إدخال أسعار صحيحة لجميع المنتجات المحددة");
      return;
    }

    setIsSaving(true);
    const result = await updateOrderItemsPrices(order.id, itemsToUpdate);
    setIsSaving(false);

    if (result.success) {
      toast.success("تم تحديث الأسعار بنجاح");
      
      const updatedItems = order.items.map(item => {
        const update = itemsToUpdate.find(i => i.id === item.id);
        return update ? { ...item, priceAtPurchase: update.newPrice } : item;
      });
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
      
      onOrderUpdated({
        ...order,
        items: updatedItems,
        totalPrice: newTotal
      });
      setPrices({});
    } else {
      toast.error(result.error || "فشل تحديث الأسعار");
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if ((newStatus === 'CONFIRMED' || newStatus === 'DELIVERED') && hasUnpricedItems) {
      toast.error("لا يمكن تأكيد الطلب قبل تحديد أسعار جميع المنتجات (التي تباع بالطن)");
      return;
    }

    setIsUpdatingStatus(true);
    const result = await updateOrderStatus(order.id, newStatus);
    setIsUpdatingStatus(false);

    if (result.success) {
      toast.success("تم تحديث حالة الطلب بنجاح");
      onOrderUpdated({ ...order, status: newStatus });
    } else {
      toast.error(result.error || "فشل تحديث حالة الطلب");
    }
  };

  const getWhatsAppLink = () => {
    const message = `أهلاً بك يا ${order.customer.name}، بخصوص طلبك رقم ${order.orderNumber} للمنتجات التي تُباع بالطن، نود الاتفاق على السعر الإجمالي لإتمام الطلب.`;
    return `https://wa.me/${order.customer.phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const getOrderDetailsWhatsAppLink = () => {
    const message = `أهلاً بك يا ${order.customer.name}،\nيسعدنا تواصلك مع مصنع البدر. تفاصيل طلبك رقم ${order.orderNumber} كالتالي:\nإجمالي الطلب: ${order.totalPrice.toLocaleString()} ج.م\nسنتواصل معك لتأكيد موعد التسليم.`;
    return `https://wa.me/${order.customer.phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] my-auto rounded-md border-zinc-100 shadow-2xl p-0 overflow-hidden bg-white flex flex-col" style={{ direction: 'rtl' }}>
        <div className="bg-zinc-50 border-b border-zinc-100 p-8 shrink-0">
          <DialogHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 text-right">
            <div>
              <DialogTitle className="text-lg font-black text-emerald-950 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
                طلب #{order.orderNumber}
              </DialogTitle>
              <p className="text-sm font-medium text-zinc-500 mt-2">
                {format(new Date(order.createdAt), 'dd MMMM yyyy | HH:mm', { locale: ar })}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select 
                value={order.status} 
                onValueChange={(val) => handleStatusChange(val as OrderStatus)}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className={cn(
                  "w-48 border-0 shadow-sm font-bold text-sm h-11 rounded-2xl px-4",
                  STATUS_MAP[order.status as keyof typeof STATUS_MAP].color
                )} dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 shadow-xl" dir="rtl">
                  {Object.entries(STATUS_MAP).map(([key, value]) => (
                    <SelectItem 
                      key={key} 
                      value={key} 
                      className="font-bold text-sm py-3 cursor-pointer"
                      disabled={(key === 'CONFIRMED' || key === 'DELIVERED') && hasUnpricedItems}
                    >
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-50/80 rounded-3xl border border-zinc-100 space-y-3">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4" /> بيانات العميل
              </h4>
              <p className="font-bold text-xl text-emerald-950">{order.customer.name}</p>
              <p className="text-sm text-zinc-500 font-medium font-mono" dir="ltr">{order.customer.phoneNumber}</p>
              <a 
                href={getOrderDetailsWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1da851] px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm mt-4 w-fit"
              >
                <MessageCircle className="w-4 h-4" />
                مراسلة العميل عبر واتساب
              </a>
            </div>
            
            <div className="p-6 bg-zinc-50/80 rounded-3xl border border-zinc-100 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> موقع التوصيل
                </h4>
                <p className="text-sm text-zinc-700 font-medium leading-relaxed line-clamp-3">
                  {order.addressText || 'لم يتم تحديد عنوان نصي'}
                </p>
              </div>
              <a 
                href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors mt-4 w-fit bg-emerald-100/50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl"
              >
                <MapPin className="w-4 h-4" />
                عرض على خرائط جوجل
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">المنتجات المطلوبة</h4>
              {hasUnpricedItems && (
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-[#25D366] bg-[#25D366]/10 px-4 py-2.5 rounded-xl hover:bg-[#25D366]/20 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  مفاوضة السعر على الواتساب
                </a>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
              <Table dir="rtl">
                <TableHeader className="bg-zinc-50 border-b border-zinc-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-right font-bold text-zinc-500 rounded-tr-3xl h-12">المنتج</TableHead>
                    <TableHead className="text-right font-bold text-zinc-500 h-12">الكمية</TableHead>
                    <TableHead className="text-left font-bold text-zinc-500 rounded-tl-3xl h-12">السعر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => {
                    const isUnpriced = item.priceAtPurchase === 0;
                    return (
                      <TableRow key={item.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                        <TableCell className="py-4">
                          <p className="font-bold text-emerald-950">{item.product.name}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm text-zinc-500 font-medium">
                            <span className="font-bold text-zinc-700">{item.quantity}</span> {item.product.unit}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-left">
                          <div className="w-full sm:w-56 ml-auto flex justify-end">
                            {isUnpriced ? (
                              <div className="relative w-full">
                                <Input 
                                  type="number"
                                  placeholder="تحديد السعر"
                                  className="h-11 w-full rounded-xl border-amber-200 bg-amber-50 focus:ring-amber-500/20 focus:border-amber-500 text-right pr-4 pl-12 font-bold"
                                  value={prices[item.id] || ''}
                                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">ج.م</span>
                              </div>
                            ) : (
                              <p className="font-black text-emerald-700 text-xl flex items-center gap-1.5 justify-end">
                                {(item.priceAtPurchase * item.quantity).toLocaleString()} 
                                <span className="text-sm font-bold text-emerald-600/70">ج.م</span>
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {hasUnpricedItems && (
                <div className="p-5 bg-amber-50/30 flex justify-end border-t border-zinc-100">
                  <Button 
                    onClick={handleSavePrices} 
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold h-11 px-8 shadow-sm shadow-amber-500/20 transition-all active:scale-95 w-full sm:w-auto"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ تسعير المنتجات المحددة'}
                  </Button>
                </div>
              )}

              <div className="p-3 bg-emerald-950 text-white flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-200 text-lg block mb-1">إجمالي الطلب</span>
                  {hasUnpricedItems && <span className="text-xs text-emerald-400 font-medium bg-emerald-900 px-3 py-1 rounded-lg">لا يشمل المنتجات غير المسعرة بعد</span>}
                </div>
                <span className="font-black text-xl flex items-baseline gap-2">
                  {order.totalPrice.toLocaleString()} 
                  <span className="text-xl font-bold text-emerald-400">ج.م</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
