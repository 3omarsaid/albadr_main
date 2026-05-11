/**
 * POST /api/admin/fcm/send
 * يرسل إشعار FCM:
 *  - إذا أُرسل token: يرسل لجهاز محدد
 *  - إذا لم يُرسل token: يرسل لكل الأجهزة المسجّلة (Broadcast)
 *
 * يُستدعى من NotificationBell عند وصول أحداث Realtime جديدة
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {prisma} from '@/lib/prisma';
import { sendFcmToToken, sendFcmToMultipleTokens } from '@/lib/firebase-admin';

// ─── Validation Schema ────────────────────────────────────────────────────────

const SendSchema = z.object({
  title:       z.string().min(1, 'العنوان مطلوب'),
  body:        z.string().min(1, 'النص مطلوب'),
  /** إذا أُرسل: إشعار لجهاز محدد. إذا غاب: broadcast لكل الأجهزة */
  token:       z.string().optional(),
  clickAction: z.string().optional(),
  data:        z.record(z.string(), z.string()).optional(),
});

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // التحقق من جلسة الأدمن
  const sessionToken = req.cookies.get('admin_session')?.value;
  if (sessionToken !== process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = SendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'بيانات غير صالحة', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, body: msgBody, token, clickAction, data } = parsed.data;

    // ── إرسال لجهاز محدد ─────────────────────────────────────────────────────
    if (token) {
      const result = await sendFcmToToken({
        token,
        title,
        body: msgBody,
        clickAction,
        data,
      });

      if (!result.success) {
        return NextResponse.json(
          { message: 'فشل الإرسال', error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'تم الإرسال', messageId: result.messageId },
        { status: 200 }
      );
    }

    // ── Broadcast لكل الأجهزة المسجّلة ────────────────────────────────────────
    const activeTokens = await prisma.adminFcmToken.findMany({
      where:  { isActive: true },
      select: { token: true },
    });

    if (activeTokens.length === 0) {
      return NextResponse.json(
        { message: 'لا توجد أجهزة مسجّلة', successCount: 0, failureCount: 0 },
        { status: 200 }
      );
    }

    const tokens = activeTokens.map((t) => t.token);
    const counts = await sendFcmToMultipleTokens(tokens, title, msgBody, data);

    return NextResponse.json(
      {
        message:      'تم الإرسال',
        successCount: counts.successCount,
        failureCount: counts.failureCount,
        totalTargets: tokens.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[FCM Send] Error:', err);
    return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
  }
}
