import React from 'react';
import { prisma } from '@/lib/prisma';
import { Users } from 'lucide-react';
import { CustomersList } from './CustomersList';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-50">
          <Users className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tight">قاعدة العملاء</h1>
          <p className="text-sm font-bold text-zinc-400">إدارة وعرض بيانات العملاء المسجلين</p>
        </div>
      </div>

      <CustomersList initialCustomers={customers} />
    </div>
  );
}
