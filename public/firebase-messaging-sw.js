/**
 * firebase-messaging-sw.js
 * Service Worker لاستقبال FCM Background Messages
 *
 * ⚠️  هذا الملف يجب أن يبقى في /public/ ويُقرأ من الـ root (/)
 *     لا تستخدم ES Modules هنا — استخدم importScripts فقط
 */

// استيراد Firebase SDK عبر CDN (مطلوب في Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── Firebase Configuration ───────────────────────────────────────────────────
// يجب مطابقة هذه القيم مع المتغيرات في .env
const firebaseConfig = {
  apiKey:            'AIzaSyAtWo_0v9V2yCeCOf9xccbJKOKjBbFUA7M',
  authDomain:        'albadr-720d4.firebaseapp.com',
  projectId:         'albadr-720d4',
  storageBucket:     'albadr-720d4.firebasestorage.app',
  messagingSenderId: '172429541178',
  appId:             '1:172429541178:web:8114faaba7cdeb3bb81a03',
};

// ─── Initialize Firebase ──────────────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ─── Background Message Handler ───────────────────────────────────────────────
/**
 * يُستدعى عند وصول إشعار والتطبيق في الخلفية (مغلق أو مخفي)
 * FCM يعرض الإشعار تلقائياً إذا كانت `notification` موجودة في الـ payload
 * لكن يمكنك تخصيص عرضه هنا
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'البدر للأسمدة';
  const notificationBody  = payload.notification?.body  || 'لديك إشعار جديد';

  const notificationOptions = {
    body:    notificationBody,
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    tag:     'albadr-admin-' + Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.clickAction || '/admin',
      ...payload.data,
    },
    actions: [
      { action: 'open',    title: 'فتح لوحة التحكم' },
      { action: 'dismiss', title: 'تجاهل'           },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ─── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/admin';

  if (event.action === 'dismiss') return;

  // فتح أو التركيز على نافذة الأدمن
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // ابحث عن تبويب الأدمن المفتوح بالفعل
      const adminClient = clientList.find((c) => c.url.includes('/admin'));
      if (adminClient) {
        adminClient.focus();
        return;
      }
      // افتح تبويب جديد
      return clients.openWindow(targetUrl);
    })
  );
});
