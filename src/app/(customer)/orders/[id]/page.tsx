import { getOrderById } from '@/actions/orderManagement';
import OrderDetailsClient from './OrderDetailsClient';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { PackageSearch, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { cn } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return { title: 'الطلب غير موجود | البدر' };
  
  return {
    title: `تفاصيل الطلب #${order.orderNumber.split('-').pop()} | البدر`,
  };
}

export default async function OrderDetailsPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-6">
        <div className="bg-muted p-6 rounded-full">
          <PackageSearch className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">عذراً، الطلب غير موجود</h2>
          <p className="text-muted-foreground">تأكد من صحة الرابط أو قم بالعودة لصفحة طلباتي.</p>
        </div>
        <Link href="/orders" className={cn(buttonVariants({ className: "rounded-full px-8 h-12 text-lg gap-2" }))}>
          <ArrowRight className="w-5 h-5" />
          العودة لطلباتي
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <OrderDetailsClient order={order} />
    </main>
  );
}
