import React from 'react';
import { getOrders } from '@/actions/orderActions';
import OrdersList from './OrdersList';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function OrdersPage() {
  const initialOrders = await getOrders();

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-50">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-emerald-950 tracking-tight">إدارة الطلبات</h1>
            <p className="text-sm font-bold text-zinc-400">عرض وتحديث حالات طلبات العملاء</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-80">
            <Search className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="بحث برقم الطلب أو اسم العميل..." 
              className="pr-12 h-12 rounded-2xl bg-white border-zinc-200/50 shadow-sm focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
          <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-zinc-200/50 text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm active:scale-95">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orders List Component */}
      <OrdersList initialOrders={initialOrders} />
    </div>
  );
}
