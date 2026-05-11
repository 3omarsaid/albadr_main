'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/components/customer/cart/CartItem';
import { CartSummary } from '@/components/customer/cart/CartSummary';
import { EmptyCart } from '@/components/customer/cart/EmptyCart';
import { AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  // Hydration fix for Zustand persist
  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-50/50"></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-zinc-100/80">
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-zinc-600 active:scale-90 transition-transform border border-zinc-100"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-black text-xl text-emerald-950 absolute left-1/2 -translate-x-1/2">
          سلة التسوق
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items
                  .filter(item => item.productId && item.productId !== "")
                  .map((item) => (
                    <CartItem key={item.productId} item={item} />
                  ))}
              </AnimatePresence>
            </div>
            
            <CartSummary />
          </div>
        )}
      </div>
    </div>
  );
}
