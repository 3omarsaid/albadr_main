'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdminHeaderActions() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm select-none">
        أ
      </div>

      {/* Logout */}
      <AlertDialog>
      <AlertDialogTrigger
        className="w-9 h-9 rounded-2xl bg-zinc-100 hover:bg-rose-50 border border-zinc-200/60 hover:border-rose-200 flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-all active:scale-90"
        aria-label="تسجيل الخروج"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </AlertDialogTrigger>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="font-black text-zinc-800">
              تسجيل الخروج؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium">
              سيتم إنهاء جلستك الحالية. ستحتاج إلى تسجيل الدخول للعودة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-xl font-bold">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white"
            >
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
