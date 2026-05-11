'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'الطلبات', href: '/admin/orders' },
  { icon: Package, label: 'المنتجات', href: '/admin/products' },
  { icon: Users, label: 'العملاء', href: '/admin/customers' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 md:top-0 inset-x-0 md:inset-x-auto md:right-0 z-50 w-full md:w-72 h-[72px] md:h-screen bg-emerald-950 text-white flex flex-row md:flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl transition-all duration-300">
      {/* Brand Logo */}
      <div className="hidden md:block p-8 border-b border-emerald-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-tight">البدر</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start px-2 md:p-6 md:space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 p-2 md:px-4 md:py-3.5 rounded-xl md:rounded-2xl transition-all duration-200 group relative overflow-hidden flex-1 md:flex-none",
                isActive 
                  ? "text-emerald-400 md:bg-emerald-500 md:text-white md:shadow-lg md:shadow-emerald-500/20" 
                  : "text-emerald-300/60 hover:bg-emerald-900/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 md:w-5 md:h-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="text-[10px] md:text-sm font-bold">{item.label}</span>
              {isActive && (
                <>
                  {/* Desktop Active indicator */}
                  <motion.div 
                    layoutId="activeTab"
                    className="hidden md:block absolute left-0 top-0 bottom-0 w-1.5 bg-white rounded-r-full"
                  />
                  {/* Mobile Active indicator */}
                  <motion.div 
                    layoutId="activeTabMobile"
                    className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-emerald-500 rounded-b-full"
                  />
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
