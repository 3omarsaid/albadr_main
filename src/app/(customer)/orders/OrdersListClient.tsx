"use client";

import { useEffect, useState } from "react";
import { getCustomerOrders } from "@/actions/orderManagement";
import type { SerializedOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Package,
  ChevronLeft,
  ShoppingBag,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  Receipt,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/stores/customerStore";

export default function OrdersListClient() {
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { customer, isInitialized } = useCustomerStore();

  async function fetchOrders(customerId: string) {
    setLoading(true);
    try {
      const data = await getCustomerOrders(customerId);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialized) {
      if (customer?.id) {
        setTimeout(() => fetchOrders(customer.id), 0);
      } else {
        setTimeout(() => setLoading(false), 0);
      }
    }
  }, [isInitialized, customer]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "قيد المراجعة",
          color: "bg-amber-50 text-amber-700 border-amber-100",
          icon: Clock,
        };
      case "CONFIRMED":
        return {
          label: "تم التأكيد",
          color: "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: CheckCircle2,
        };
      case "DELIVERED":
        return {
          label: "تم التوصيل",
          color: "bg-blue-50 text-blue-700 border-blue-100",
          icon: Truck,
        };
      case "CANCELLED":
        return {
          label: "تم الإلغاء",
          color: "bg-red-50 text-red-700 border-red-100",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: "bg-slate-50 text-slate-700 border-slate-100",
          icon: Package,
        };
    }
  };

  const hasTonItems = (order: SerializedOrder) => {
    return order.items?.some(
      (item) => item.product?.unit === "طن" || item.product?.unit === "Ton",
    );
  };

  if (!isInitialized || loading) {
    return (
      <div className="p-5 space-y-6 bg-[#F9FAFB] min-h-screen pb-32" dir="rtl">
        <div className="space-y-2 pt-4">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer || orders.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[90vh] p-8 text-center bg-[#F9FAFB] pb-32"
        dir="rtl"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#0a4d3c]/10" />
          <div className="relative bg-white p-10 rounded-full shadow-2xl shadow-[#0a4d3c]/5 border border-slate-100">
            <ShoppingBag className="w-20 h-20 text-[#0a4d3c]/40" />
          </div>
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-black text-slate-900 leading-tight">
            لا توجد طلبات سابقة
          </h2>
          <p className="text-slate-500 font-bold leading-relaxed">
            يبدو أنك لم تقم بأي طلبات بعد. ابدأ باستكشاف منتجاتنا الزراعية
            العضوية الفاخرة الآن.
          </p>
        </div>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-10 rounded-[1.5rem] px-12 h-16 text-xl font-black bg-[#0a4d3c] hover:bg-[#0a4d3c]/90 shadow-2xl shadow-[#0a4d3c]/20 transition-all hover:scale-[1.05]",
          )}
        >
          ابدأ التسوق
        </Link>
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-8 space-y-6 pb-40 bg-[#F9FAFB] min-h-screen"
      dir="rtl"
    >
      {/* Page Header */}
      <div className="flex items-center gap-4 pt-4">
        <Link
          href="/profile"
          className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6 rotate-180" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            طلباتي
          </h1>
          <p className="text-slate-400 text-xs sm:text-lg font-bold">
            {orders.length} طلب في سجل مشترياتك
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-3 sm:gap-4">
        {orders.map((order) => {
          const isTentative = hasTonItems(order);
          const status = getStatusConfig(order.status);
          const formattedDate = format(new Date(order.createdAt), "d MMM", {
            locale: ar,
          });
          const orderNum = order.orderNumber.split("-").pop();

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="p-3 sm:p-5 flex items-center gap-3 sm:gap-6">
                {/* Order Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0a4d3c] shrink-0 transition-colors group-hover:bg-[#0a4d3c] group-hover:text-white">
                  <Receipt className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-xl font-black text-slate-900 leading-none truncate">
                      طلب #{orderNum}
                    </h3>
                    <Badge
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] sm:text-[12px] font-black border shadow-none",
                        status.color,
                      )}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formattedDate}
                  </p>
                </div>

                {/* Price/Items */}
                <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-left">
                  <p className="text-xs sm:text-xl font-black text-[#0a4d3c] whitespace-nowrap">
                    {isTentative ? (
                      <span className="text-amber-600 text-[10px] sm:text-base">
                        يتم الاتفاق
                      </span>
                    ) : (
                      `${order.totalPrice.toLocaleString()} ج.م`
                    )}
                  </p>
                  <p className="text-[9px] sm:text-xs font-black text-slate-300 uppercase">
                    {order.items?.length} صنف
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-slate-300 group-hover:text-[#0a4d3c] transition-colors pr-1">
                  <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#0a4d3c] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
