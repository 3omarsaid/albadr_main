'use client';

/**
 * useFcmToken.ts
 * Hook يُدير دورة حياة FCM Token:
 *  1. طلب صلاحية الإشعارات من المستخدم
 *  2. توليد FCM Token بواسطة getToken()
 *  3. إرسال Token للـ API Route لحفظه في قاعدة البيانات
 *  4. الاستماع للرسائل الواردة عند التطبيق في المقدمة (Foreground)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FcmPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export interface FcmForegroundPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface UseFcmTokenOptions {
  /** Callback يُستدعى عند وصول رسالة في المقدمة */
  onForegroundMessage?: (payload: FcmForegroundPayload) => void;
  /** تفعيل التسجيل التلقائي عند تحميل الـ Hook (افتراضي: false) */
  autoRegister?: boolean;
}

export interface UseFcmTokenReturn {
  /** حالة إذن الإشعارات */
  permissionStatus: FcmPermissionStatus;
  /** FCM Token الحالي (null إذا لم يُولَّد بعد) */
  fcmToken: string | null;
  /** هل جارٍ تسجيل التوكن؟ */
  isRegistering: boolean;
  /** طلب الإذن وتسجيل التوكن يدوياً */
  requestAndRegister: () => Promise<void>;
}

// ─── VAPID Key ───────────────────────────────────────────────────────────────

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFcmToken(options: UseFcmTokenOptions = {}): UseFcmTokenReturn {
  const { onForegroundMessage, autoRegister = false } = options;

  const [permissionStatus, setPermissionStatus] = useState<FcmPermissionStatus>('idle');
  const [fcmToken, setFcmToken]                 = useState<string | null>(null);
  const [isRegistering, setIsRegistering]       = useState(false);

  // مرجع للـ unsubscribe لمنع التسجيل المتكرر
  const unsubRef = useRef<Unsubscribe | null>(null);
  // منع إرسال نفس التوكن مرتين
  const registeredTokenRef = useRef<string | null>(null);

  // ─── Register Token with Backend ────────────────────────────────────────────

  const saveTokenToBackend = useCallback(async (token: string) => {
    if (registeredTokenRef.current === token) return; // مسجّل بالفعل

    try {
      const res = await fetch('/api/admin/fcm/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          device:    'web',
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        console.warn('[FCM] Token registration failed:', err.message);
        return;
      }

      registeredTokenRef.current = token;
      console.info('[FCM] ✅ Token registered successfully');
    } catch (err) {
      console.error('[FCM] Network error while saving token:', err);
    }
  }, []);

  // ─── Main Registration Flow ─────────────────────────────────────────────────

  const requestAndRegister = useCallback(async () => {
    // التحقق من دعم المتصفح
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    setIsRegistering(true);
    setPermissionStatus('requesting');

    try {
      // 1. طلب الإذن
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setPermissionStatus('denied');
        console.warn('[FCM] Notification permission denied.');
        return;
      }

      setPermissionStatus('granted');

      // 2. تسجيل Service Worker
      let swRegistration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );
        console.info('[FCM] Service Worker registered:', swRegistration.scope);

        // الانتظار حتى يصبح الـ Service Worker نشطاً (Active) لتجنب أخطاء التسجيل
        if (!swRegistration.active) {
          console.info('[FCM] Service worker is not active yet. Waiting for activation...');
          const activeWorker = swRegistration.installing || swRegistration.waiting;
          if (activeWorker) {
            await new Promise<void>((resolve) => {
              const stateChangeHandler = () => {
                if (activeWorker.state === 'activated') {
                  activeWorker.removeEventListener('statechange', stateChangeHandler);
                  console.info('[FCM] Service worker activated.');
                  resolve();
                }
              };
              activeWorker.addEventListener('statechange', stateChangeHandler);
              // التحقق الاحتياطي في حال تنشيطه أثناء تعيين المستمع
              if (activeWorker.state === 'activated') {
                activeWorker.removeEventListener('statechange', stateChangeHandler);
                resolve();
              }
            });
          }
        }
      }

      // 3. الحصول على Messaging Instance
      const messaging = getFirebaseMessaging();
      if (!messaging) {
        console.error('[FCM] Firebase Messaging not available');
        return;
      }

      // 4. توليد FCM Token
      const token = await getToken(messaging, {
        vapidKey:            VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (!token) {
        console.warn('[FCM] Empty token received');
        return;
      }

      setFcmToken(token);
      console.info('[FCM] Token generated:', token.slice(0, 20) + '...');

      // 5. حفظ التوكن في الـ Backend
      await saveTokenToBackend(token);

      // 6. الاستماع للرسائل في المقدمة (Foreground)
      if (unsubRef.current) unsubRef.current(); // إلغاء الاشتراك السابق
      unsubRef.current = onMessage(messaging, (payload) => {
        console.info('[FCM] Foreground message received:', payload);
        if (onForegroundMessage) {
          onForegroundMessage({
            title: payload.notification?.title ?? 'البدر للأسمدة',
            body:  payload.notification?.body  ?? 'لديك إشعار جديد',
            data:  payload.data as Record<string, string> | undefined,
          });
        }
      });
    } catch (err) {
      console.error('[FCM] Registration error:', err);
      setPermissionStatus('idle');
    } finally {
      setIsRegistering(false);
    }
  }, [onForegroundMessage, saveTokenToBackend]);

  // ─── Auto Register on Mount ─────────────────────────────────────────────────

  useEffect(() => {
    if (!autoRegister) return;

    // تأجير بسيط لتجنب race conditions مع تهيئة المتصفح
    const timer = setTimeout(() => {
      requestAndRegister();
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRegister]);

  return {
    permissionStatus,
    fcmToken,
    isRegistering,
    requestAndRegister,
  };
}
