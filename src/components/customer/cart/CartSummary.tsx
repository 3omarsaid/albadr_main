'use client';

import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export const CartSummary = () => {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const hasNegotiableItem = items.some(item => item.price === 0 || item.unit.includes('طن'));
  const total = getTotalPrice();

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 space-y-5">
      <h2 className="font-bold text-lg text-emerald-950">ملخص الطلب</h2>
      
      {hasNegotiableItem && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3 shadow-sm shadow-amber-100/50">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 font-bold leading-relaxed">
            يحتوي طلبك على منتجات تتطلب تحديد السعر. سيتم تأكيد طلبك والأسعار النهائية عبر الواتساب.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center text-zinc-600 text-sm">
          <span>المجموع المبدئي</span>
          <span className="font-bold">
            {hasNegotiableItem && total === 0 ? 'يحدد لاحقاً' : `${total.toLocaleString()} ج.م`}
          </span>
        </div>
        <div className="flex justify-between items-center text-zinc-600 text-sm">
          <span>التوصيل</span>
          <span className="font-bold text-emerald-600">يحدد لاحقاً</span>
        </div>
        <div className="h-px bg-zinc-100 w-full my-2"></div>
        <div className="flex justify-between items-center">
          <span className="font-black text-emerald-950">الإجمالي المبدئي</span>
          <span className="font-black text-2xl text-emerald-700">
            {hasNegotiableItem && total === 0 ? 'يحدد لاحقاً' : `${total.toLocaleString()} ج.م`}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <Link 
          href="/checkout"
          className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white h-14 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 transition-all duration-300"
        >
          {hasNegotiableItem ? 'متابعة لتأكيد الطلب (واتساب)' : 'متابعة الطلب'}
        </Link>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-zinc-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>الدفع عند الاستلام متاح</span>
        </div>
      </div>
    </div>
  );
};
