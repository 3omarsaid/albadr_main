import React from 'react';
import { HeroBanner } from '@/components/customer/HeroBanner';
import { CategoryBar } from '@/components/customer/CategoryBar';
import { ProductGrid } from '@/components/customer/ProductGrid';
import { Search, Menu, ShoppingBasket } from 'lucide-react';
import { getProducts } from '@/actions/productActions';

export default async function HomePage() {
  const products =await getProducts();
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="bg-primary p-2 rounded-xl">
            <ShoppingBasket className="text-white w-6 h-6" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-secondary">البدر</h1>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse text-muted-foreground">
          <Search className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />
          <Menu className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />
        </div>
      </header>

      {/* Hero Banner */}
      <div className="px-4 mt-4">
        <HeroBanner />
      </div>

      {/* Categories */}
      <div className="mt-8">
        <h2 className="px-6 font-heading font-bold text-xl mb-2">التصنيفات</h2>
        <CategoryBar />
      </div>

      {/* Products */}
      <div className="mt-4">
        <h2 className="px-6 font-heading font-bold text-xl mb-4">أحدث المنتجات</h2>
        <ProductGrid products={products} />
      </div>

    </main>
  );
}
