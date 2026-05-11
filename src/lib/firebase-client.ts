/**
 * firebase-client.ts
 * تهيئة Firebase Client SDK للمتصفح
 * لا تستورد هذا الملف في Server Components أو API Routes
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

// ─── Firebase Config ────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ─── Singleton Initialization ────────────────────────────────────────────────

/**
 * إرجاع Firebase App — يمنع التهيئة المتكررة (Singleton)
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

/**
 * إرجاع Firebase Messaging instance
 * يجب استدعاؤها داخل بيئة المتصفح فقط (typeof window !== 'undefined')
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  try {
    const app = getFirebaseApp();
    return getMessaging(app);
  } catch (err) {
    console.error('[FCM] Failed to initialize messaging:', err);
    return null;
  }
}
