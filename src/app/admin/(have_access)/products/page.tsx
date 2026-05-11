import React from 'react';
import { getProducts } from '@/actions/productActions';
import ProductsList from './ProductsList';
import { Package, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProductsPage() {
  const initialProducts = await getProducts();

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-50">
            <Package className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-emerald-950 tracking-tight">إدارة المنتجات</h1>
            <p className="text-sm font-bold text-zinc-400">إضافة وتعديل وحذف منتجات المتجر</p>
          </div>
        </div>

      </div>

      {/* Products List Component */}
      <ProductsList initialProducts={initialProducts} />
    </div>
  );
}
