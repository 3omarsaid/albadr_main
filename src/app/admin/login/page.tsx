'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, User, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormState = 'idle' | 'loading' | 'error';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || formState === 'loading') return;

    setFormState('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      // Success, redirect to dashboard
      router.push('/admin');
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
      setFormState('error');
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-900 flex items-center justify-center p-4"
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-tight">
                لوحة إدارة البدر
              </h1>
              <p className="text-emerald-400/80 text-sm font-medium mt-1">
                Bio-AgriTech Admin
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-bold text-white/70"
                >
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    required
                    dir="ltr"
                    disabled={formState === 'loading'}
                    className="h-14 pr-12 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 focus:ring-4 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-white/70"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    dir="ltr"
                    disabled={formState === 'loading'}
                    className="h-14 pr-12 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 focus:ring-4 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {formState === 'error' && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="text-rose-300 text-sm font-medium">
                  {errorMessage || 'حدث خطأ، يرجى المحاولة مرة أخرى'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={formState === 'loading' || !username.trim() || !password.trim()}
              className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {formState === 'loading' ? (
                <span className="flex items-center gap-3 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الدخول...
                </span>
              ) : (
                <span className="flex items-center gap-3 justify-center">
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs font-medium mt-6">
          © 2025 البدر Bio-AgriTech — لوحة تحكم إدارية مؤمّنة
        </p>
      </div>
    </div>
  );
}
