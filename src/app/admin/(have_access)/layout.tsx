import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { AdminHeaderActions } from '@/components/admin/AdminHeaderActions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-row-reverse" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 md:mr-72 min-h-screen pb-20 md:pb-0">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-white/70 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-widest">
              مرحباً بك مجدداً
            </h2>
            <p className="text-lg font-black text-emerald-950">
              لوحة إدارة البدر
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Notification Bell (Client Component — Realtime subscription) */}
            <NotificationBell />

            {/* Admin Avatar + Logout */}
            <AdminHeaderActions />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
