'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Bell, ShoppingBag, RefreshCw, CheckCheck, BellRing } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useAdminStore } from '@/stores/adminStore';
import { useFcmToken } from '@/hooks/useFcmToken';

// ─── Arabic Status Labels ─────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'قيد الانتظار',
  CONFIRMED: 'تم التأكيد',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
};

// ─── Browser Notification Helper ─────────────────────────────────────────────

function requestBrowserNotification(title: string, body: string) {
  if (!('Notification' in window)) return;

  const show = () => {
    try {
      new Notification(title, {
        body,
        icon:  '/favicon.ico',
        badge: '/favicon.ico',
        tag:   `albadr-order-${Date.now()}`,
      });
    } catch (err) {
      console.warn('[BrowserNotification] Failed to show:', err);
    }
  };

  if (Notification.permission === 'granted') {
    show();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') show();
    });
  }
}

// ─── FCM Broadcast Helper ─────────────────────────────────────────────────────

/**
 * يُرسل إشعار FCM لجميع أجهزة الأدمن المسجّلة عبر الـ API
 * يعمل بالتوازي مع منطق الإشعارات الداخلي — لا ينتظر النتيجة
 */
async function broadcastFcmNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    await fetch('/api/admin/fcm/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, body, data, clickAction: '/admin' }),
    });
  } catch (err) {
    // لا نوقف منطق الإشعارات الأخرى بسبب فشل FCM
    console.warn('[FCM Broadcast] Failed:', err);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const supabase    = createSupabaseBrowserClient();
  const channelRef  = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    appendLiveOrder,
    updateLiveOrder,
  } = useAdminStore();

  // ─── FCM Integration ────────────────────────────────────────────────────────
  // autoRegister=true: يطلب الإذن تلقائياً بعد 2 ثانية من تحميل اللوحة
  const { permissionStatus, requestAndRegister } = useFcmToken({
    autoRegister: true,

    // رسائل المقدمة (عندما يكون تبويب الأدمن مفتوحاً)
    // FCM يُرسل الرسالة لكل الأجهزة — هنا نعرضها في نفس الجهاز كـ toast إضافي
    onForegroundMessage: ({ title, body }) => {
      toast(title, {
        description: body,
        duration:    6000,
        icon:        <BellRing className="w-4 h-4 text-emerald-500" />,
      });
    },
  });

  // ─── Sound Notification ──────────────────────────────────────────────────────

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.warn('[AudioNotification] Autoplay blocked or failed:', err);
      });
    } catch (err) {
      console.warn('[AudioNotification] Error playing sound:', err);
    }
  }, []);

  // ─── Realtime Event Handler ──────────────────────────────────────────────────

  const handleRealtimeEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventType: 'INSERT' | 'UPDATE', payload: any) => {
      const record      = payload.new ?? payload.record;
      const orderNumber = record?.orderNumber ?? record?.order_number ?? '—';
      const status: string = record?.status ?? '';
      const arabicStatus   = STATUS_LABELS[status] ?? status;

      let message      = '';
      let toastMessage = '';
      let fcmTitle     = '';

      if (eventType === 'INSERT') {
        message      = `طلب جديد #${orderNumber} بانتظار المعالجة`;
        toastMessage = `🛒 طلب جديد! — #${orderNumber}`;
        fcmTitle     = '🛒 طلب جديد — البدر للأسمدة';

        appendLiveOrder({
          id:            record?.id ?? '',
          orderNumber,
          customerId:    record?.customerId ?? record?.customer_id ?? '',
          addressId:     record?.addressId  ?? record?.address_id  ?? '',
          totalPrice:    Number(record?.totalPrice ?? record?.total_price ?? 0),
          status:        record?.status ?? 'PENDING',
          paymentMethod: record?.paymentMethod ?? record?.payment_method ?? 'cash_on_delivery',
          createdAt:     record?.createdAt ?? record?.created_at ?? new Date().toISOString(),
          updatedAt:     record?.updatedAt ?? record?.updated_at ?? new Date().toISOString(),
          addressText:   null,
          latitude:      0,
          longitude:     0,
          customer: {
            id:          '',
            phoneNumber: '',
            name:        'عميل جديد',
            createdAt:   new Date().toISOString(),
            updatedAt:   new Date().toISOString(),
          },
          items: [],
        });
      } else {
        message      = `تحديث الطلب #${orderNumber} — الحالة: ${arabicStatus}`;
        toastMessage = `🔄 تحديث طلب #${orderNumber} → ${arabicStatus}`;
        fcmTitle     = '🔄 تحديث طلب — البدر للأسمدة';

        if (record?.id) {
          updateLiveOrder(record.id, {
            status:    record.status,
            updatedAt: record?.updated_at ?? record?.updatedAt ?? new Date().toISOString(),
          });
        }
      }

      // ┌─────────────────────────────────────────────────────────────────────┐
      // │  سلسلة الإشعارات المتوازية                                          │
      // └─────────────────────────────────────────────────────────────────────┘

      // 1. الإشعار الداخلي (In-app Bell)
      addNotification({ type: eventType, table: 'Order', orderNumber, status, message });

      // 2. الصوت
      playNotificationSound();

      // 3. Sonner Toast
      toast(toastMessage, {
        description: new Date().toLocaleTimeString('ar-EG'),
        duration:    5000,
      });

      // 4. إشعار المتصفح الأصلي (Notification API — للتبويب المفتوح)
      requestBrowserNotification(
        eventType === 'INSERT' ? 'طلب جديد — البدر' : 'تحديث طلب — البدر',
        message
      );

      // 5. FCM Push Notification (للأجهزة الأخرى / التبويبات الأخرى / الخلفية)
      // fire-and-forget — لا نعيق منطق الـ UI
      broadcastFcmNotification(fcmTitle, message, {
        orderNumber,
        eventType,
        status,
        timestamp: new Date().toISOString(),
      });
    },
    [addNotification, appendLiveOrder, updateLiveOrder, playNotificationSound]
  );

  // ─── Supabase Realtime Subscription ────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Order' },
        (payload) => handleRealtimeEvent('INSERT', payload)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Order' },
        (payload) => handleRealtimeEvent('UPDATE', payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] ✅ Subscribed to Order changes');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [handleRealtimeEvent, supabase]);

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <Popover>
      <PopoverTrigger
        className="relative w-10 h-10 rounded-2xl bg-zinc-100 hover:bg-emerald-50 border border-zinc-200/60 hover:border-emerald-200 flex items-center justify-center text-zinc-500 hover:text-emerald-600 transition-all active:scale-90"
        aria-label={`الإشعارات — ${unreadCount} غير مقروء`}
        onClick={markAllRead}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-bounce shadow-sm shadow-rose-500/50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 rounded-2xl border-zinc-100 shadow-xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-50 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-500" />
            <span className="font-black text-sm text-zinc-700">الإشعارات</span>
          </div>

          <div className="flex items-center gap-2">
            {/* مؤشر حالة FCM */}
            {permissionStatus === 'denied' && (
              <button
                onClick={requestAndRegister}
                title="إشعارات الجهاز معطّلة — انقر للتفعيل"
                className="text-[10px] font-bold text-amber-500 border border-amber-200 rounded-lg px-2 py-0.5 hover:bg-amber-50 transition-colors"
              >
                تفعيل FCM
              </button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-7 px-2 text-xs text-zinc-400 hover:text-emerald-600 rounded-xl"
              >
                <CheckCheck className="w-3.5 h-3.5 me-1" />
                قراءة الكل
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-zinc-300">
              <Bell className="w-10 h-10" />
              <p className="text-sm font-bold">لا توجد إشعارات جديدة</p>
              <p className="text-xs text-center px-6 leading-relaxed">
                ستظهر هنا تحديثات الطلبات والأحداث المباشرة تلقائياً
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'flex gap-3 px-5 py-4 transition-colors',
                  notif.isRead ? 'bg-white' : 'bg-emerald-50/50'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                    notif.type === 'INSERT'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-blue-100 text-blue-600'
                  )}
                >
                  {notif.type === 'INSERT' ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-700 leading-snug">
                    {notif.message}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    {formatDistanceToNow(notif.timestamp, {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100">
            <p className="text-xs text-zinc-400 font-medium text-center">
              {notifications.length} إشعار في هذه الجلسة
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
