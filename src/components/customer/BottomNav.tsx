'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'الرئيسية', icon: Home, path: '/' },
  { name: 'السلة', icon: ShoppingCart, path: '/cart', showBadge: true },
  { name: 'طلباتي', icon: ClipboardList, path: '/orders' },
  { name: 'حسابي', icon: User, path: '/profile' },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const cartItemsCount = useCartStore((state) => state.items.length);

  // Hide on product details page
  if (pathname.startsWith('/product/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex justify-between items-center h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${
                isActive ? 'text-[#0a4d3c] scale-110' : 'text-slate-400 hover:text-[#0a4d3c]/70'
              }`}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "fill-[#0a4d3c]/10")} />
                {item.showBadge && cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#0a4d3c] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
