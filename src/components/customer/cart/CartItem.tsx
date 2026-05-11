'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: {
    productId: string;
    productName: string;
    unit: string;
    price: number;
    quantity: number;
    image: string;
  };
}

export const CartItem = ({ item }: CartItemProps) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // The "Ton" Rule: If unit contains "طن" or price is 0
  const isNegotiable = item.price === 0 || item.unit.includes('طن');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-zinc-100"
    >
      <div className="relative w-20 h-20 shrink-0 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100">
        <Image 
          src={item.image} 
          alt={item.productName} 
          fill 
          className="object-cover"
        />
      </div>

      <div className="flex flex-col flex-grow justify-between py-0.5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-emerald-950 leading-tight">
              {item.productName}
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              الوحدة: {item.unit}
            </span>
          </div>
          <button 
            onClick={() => removeItem(item.productId)}
            className="text-zinc-400 hover:text-red-500 transition-colors p-1"
            aria-label="حذف المنتج"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-emerald-700">
            {isNegotiable ? (
              <span className="text-amber-600 text-sm">يحدد لاحقاً</span>
            ) : (
              <>{(item.price * item.quantity).toLocaleString()} <span className="text-xs font-bold text-zinc-500">ج.م</span></>
            )}
          </span>

          <div className="flex items-center bg-zinc-50 rounded-lg p-1 border border-zinc-200/50">
            <button
              onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-zinc-600 active:scale-95 disabled:opacity-50"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-black text-emerald-950">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-zinc-600 active:scale-95"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
