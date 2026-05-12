'use client';

import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Phone, Calendar, History } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CustomerHistoryDialog } from './CustomerHistoryDialog';
type Customers = ({
    _count: {
        orders: number;
    };
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    phoneNumber: string;
})[]

export function CustomersList({ initialCustomers }: { initialCustomers: Customers }) {
  const [customers] = useState(initialCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const openHistory = (id: string, name: string) => {
    setSelectedCustomerId(id);
    setSelectedCustomerName(name);
    setIsHistoryOpen(true);
  };

  return (
    <>
      {/* ── Mobile Card List ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {customers.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-zinc-400 font-bold border border-zinc-100">
            لا يوجد عملاء مسجلين حالياً
          </div>
        ) : customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-emerald-950 text-base">{customer.name}</p>
                <div className="flex items-center gap-1.5 mt-1 text-zinc-500 text-sm">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-medium">{customer.phoneNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 rounded-2xl px-3 py-1.5">
                <span className="font-black text-emerald-700 text-sm">{customer._count.orders}</span>
                <span className="text-xs font-bold text-emerald-600/70">طلب</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-50 pt-3">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: ar })}
                </span>
              </div>
              <button 
                onClick={() => openHistory(customer.id, customer.name)}
                className="text-sm font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all"
              >
                <History className="w-4 h-4" />
                عرض السجل
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-[32px] shadow-sm border border-zinc-100">
        <div className="w-full overflow-x-auto pb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50">
                <TableHead className="text-right px-8 font-bold py-5">اسم العميل</TableHead>
                <TableHead className="text-right font-bold">رقم الهاتف</TableHead>
                <TableHead className="text-right font-bold">تاريخ التسجيل</TableHead>
                <TableHead className="text-right font-bold">عدد الطلبات</TableHead>
                <TableHead className="text-right px-8 font-bold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-zinc-50/20 transition-colors">
                  <TableCell className="px-8 font-bold text-emerald-950 whitespace-nowrap">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-zinc-600 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      {customer.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                        {customer._count.orders}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">طلب</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 whitespace-nowrap">
                    <button 
                      onClick={() => openHistory(customer.id, customer.name)}
                      className="text-sm font-black text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-2 transition-all"
                    >
                      <History className="w-4 h-4" />
                      عرض السجل
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-zinc-400 font-bold">
                    لا يوجد عملاء مسجلين حالياً
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CustomerHistoryDialog 
        customerId={selectedCustomerId || ''}
        customerName={selectedCustomerName}
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </>
  );
}
