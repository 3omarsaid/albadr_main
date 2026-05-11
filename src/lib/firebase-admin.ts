/**
 * firebase-admin.ts
 * تهيئة Firebase Admin SDK — للـ Server-side فقط (API Routes)
 * لا تستورد هذا الملف في Client Components أو Service Workers
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FcmSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface FcmNotificationPayload {
  token: string;
  title: string;
  body: string;
  /** رابط اختياري يُفتح عند النقر على الإشعار */
  clickAction?: string;
  /** بيانات إضافية تُرسل مع الإشعار */
  data?: Record<string, string>;
}

// ─── Singleton Admin App ─────────────────────────────────────────────────────

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId    = process.env.FIREBASE_PROJECT_ID;
  const clientEmail  = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey   = process.env.FIREBASE_PRIVATE_KEY;

  // التحقق من توفر بيانات الاعتماد
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[FirebaseAdmin] Missing credentials. Set FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // يحتوي الـ private key على \n كـ string — يجب استبدالها بسطر جديد فعلي
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

// ─── FCM Sender ──────────────────────────────────────────────────────────────

/**
 * إرسال إشعار FCM لجهاز واحد محدد بـ token
 */
export async function sendFcmToToken(
  payload: FcmNotificationPayload
): Promise<FcmSendResult> {
  try {
    const app: App = getAdminApp();
    const messaging: Messaging = getMessaging(app);

    const messageId = await messaging.send({
      token: payload.token,
      notification: {
        title: payload.title,
        body:  payload.body,
      },
      webpush: {
        notification: {
          title:  payload.title,
          body:   payload.body,
          icon:   '/favicon.ico',
          badge:  '/favicon.ico',
          click_action: payload.clickAction ?? '/admin',
          requireInteraction: true,
          ...(payload.data ? { data: payload.data } : {}),
        },
        fcmOptions: {
          link: payload.clickAction ?? '/admin',
        },
      },
      data: payload.data,
    });

    return { success: true, messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[FCM] Failed to send message:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * إرسال إشعار FCM لمجموعة من الأجهزة (Multicast)
 */
export async function sendFcmToMultipleTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

  const app: App = getAdminApp();
  const messaging: Messaging = getMessaging(app);

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: {
      notification: {
        title,
        body,
        icon:  '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
      },
      fcmOptions: { link: '/admin' },
    },
    data,
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
}
