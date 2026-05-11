import OrdersListClient from './OrdersListClient';

export const metadata = {
  title: 'طلباتي | البدر للتجارة والتوريدات',
  description: 'عرض طلباتك السابقة وتتبع حالة الشحن',
};

export default function MyOrdersPage() {
  return (
    <main className="min-h-screen bg-background">
      <OrdersListClient />
    </main>
  );
}
