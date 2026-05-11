import React from 'react';
import { getDashboardStats } from '@/actions/orderActions';
import { DashboardChart } from '@/components/admin/DashboardChart';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle2,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: 'إجمالي المبيعات',
      value: `${stats.totalRevenue.toLocaleString()} ج.م`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'طلبات قيد الانتظار',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'المنتجات النشطة',
      value: stats.activeProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const statusMap = {
    'PENDING': { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
    'CONFIRMED': { label: 'تم التأكيد', color: 'bg-blue-100 text-blue-700' },
    'DELIVERED': { label: 'تم التوصيل', color: 'bg-emerald-100 text-emerald-700' },
    'CANCELLED': { label: 'ملغي', color: 'bg-rose-100 text-rose-700' },
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-500 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-black text-emerald-950">{card.value}</h3>
                </div>
                <div className={`${card.bg} p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 pb-6 px-8">
            <CardTitle className="text-lg font-black text-emerald-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              أحدث الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                  <TableHead className="text-right px-8 font-bold">رقم الطلب</TableHead>
                  <TableHead className="text-right font-bold">العميل</TableHead>
                  <TableHead className="text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">المبلغ</TableHead>
                  <TableHead className="text-right px-8 font-bold">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="px-8 font-black text-sm text-emerald-900">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="font-bold text-zinc-700">
                      {order.customer.name}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-xs">
                      {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell className="font-black text-emerald-700">
                      {order.totalPrice.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell className="px-8">
                      <Badge className={`${statusMap[order.status as keyof typeof statusMap].color} border-0 font-bold px-3 py-1 rounded-lg text-[10px]`}>
                        {statusMap[order.status as keyof typeof statusMap].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <div className="lg:col-span-1">
          <DashboardChart />
        </div>
      </div>
    </div>
  );
}
