'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBasket } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyCart = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-sm">
        <ShoppingBasket className="w-16 h-16 text-emerald-200" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-emerald-950 mb-3">سلتك فارغة</h2>
      <p className="text-zinc-500 font-medium mb-8 max-w-[250px]">
        لم تقم بإضافة أي منتجات إلى سلتك حتى الآن. استكشف منتجاتنا وأضف ما تحتاجه.
      </p>
      <Link 
        href="/"
        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white h-14 px-8 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-200 transition-all"
      >
        ابدأ التسوق
      </Link>
    </motion.div>
  );
};
