/**
 * POST /api/admin/fcm/register
 * يستقبل FCM Token من المتصفح ويحفظه في جدول AdminFcmToken
 * محمي بـ admin session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {prisma} from '@/lib/prisma';

// ─── Validation Schema ────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  token:     z.string().min(10, 'Token غير صالح'),
  device:    z.enum(['web', 'android', 'ios']).default('web'),
  userAgent: z.string().optional(),
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
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'بيانات غير صالحة', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, device, userAgent } = parsed.data;

    // Upsert: إنشاء أو تحديث التوكن (unique على token)
    const record = await prisma.adminFcmToken.upsert({
      where:  { token },
      update: { isActive: true, userAgent, updatedAt: new Date() },
      create: { token, device, userAgent, isActive: true },
    });

    return NextResponse.json(
      { message: 'تم حفظ التوكن بنجاح', id: record.id },
      { status: 200 }
    );
  } catch (err) {
    console.error('[FCM Register] Error:', err);
    return NextResponse.json({ message: 'خطأ في الخادم' }, { status: 500 });
  }
}
