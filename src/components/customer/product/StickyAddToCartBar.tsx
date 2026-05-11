"use client";

import React from "react";
import { ShoppingCart, AlertCircle, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface StickyAddToCartBarProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
  };
  quantity: number;
}

export const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  quantity,
}) => {
  const addItem = useCartStore((state) => state.addItem);
  const cartItemsCount = useCartStore((state) => state.items.length);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      price: product.price,
      quantity: quantity,
      image: product.image,
    });

    toast.success("تمت الإضافة للسلة بنجاح", {
      position: "top-center",
      style: {
        background: "#064E3B",
        color: "#fff",
        borderRadius: "16px",
        direction: "rtl",
        fontFamily: "inherit",
      },
    });
  };

  const isNegotiable = product.price === 0 || product.unit.includes("طن");
  const totalPrice = product.price * quantity;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-2xl border-t border-zinc-100 px-4 py-3 pb-safe shadow-[0_-12px_40px_rgba(0,0,0,0.06)] lg:px-8">
      <div className="max-w-md mx-auto space-y-3">
        <AnimatePresence>
          {isNegotiable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-900 font-bold leading-tight">
                هذا السعر مبدئي وسيتم الاتفاق على السعر النهائي عبر الواتساب
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 items-center">
          {/* Cart Shortcut */}
          <Link
            href="/cart"
            className="relative p-3 gap-2 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-emerald-600 transition-colors border border-zinc-100 active:scale-90"
          >
            <span className="text-md font-black">السلة</span>
            <ShoppingBag className="w-5 h-5"/>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </Link>
          

          {/* Price Info */}
          <div className="flex-1 min-w-0">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">
              الإجمالي
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-950 truncate">
                {totalPrice === 0 ? "يحدد لاحقاً" : totalPrice.toLocaleString()}
              </span>
              {totalPrice > 0 && (
                <span className="text-[10px] font-bold text-zinc-400">ج.م</span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="flex-[1.5] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white h-12 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/10 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-black text-sm">أضف للسلة</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
