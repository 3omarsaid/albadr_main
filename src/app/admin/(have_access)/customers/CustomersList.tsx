'use client';

import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Phone, Calendar, History } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CustomerHistoryDialog } from './CustomerHistoryDialog';

export function CustomersList({ initialCustomers }: { initialCustomers: any[] }) {
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
      <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100">
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
