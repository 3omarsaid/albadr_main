"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Package,
  MapPin,
  Calendar,
  MessageCircle,
  XCircle,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cancelOrder, updateOrderAddress } from "@/actions/orderManagement";
import { SerializedOrder } from "@/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCustomerStore } from "@/stores/customerStore";

interface OrderDetailsClientProps {
  order: SerializedOrder;
}

export default function OrderDetailsClient({
  order: initialOrder,
}: OrderDetailsClientProps) {
  const { customer, isInitialized } = useCustomerStore();
  const router = useRouter();

  const [order, setOrder] = useState<SerializedOrder>(initialOrder);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [newAddress, setNewAddress] = useState(
    order.address?.addressText || "",
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Redirect if not logged in or doesn't own the order
  useEffect(() => {
    if (isInitialized) {
      if (!customer || customer.id !== initialOrder.customerId) {
        toast.error("غير مسموح لك بالوصول لهذا الطلب");
        router.push("/orders");
      }
    }
  }, [isInitialized, customer, initialOrder.customerId, router]);

  const ADMIN_PHONE = process.env.NEXT_PUBLIC_ADMIN_PHONE || "+201055035521";
  const whatsappLink = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(
    `السلام عليكم، بخصوص طلبي رقم #${order.orderNumber.split("-").pop()}
    ${order?.address ? `العنوان: ${order.address.addressText}` : ""}`,
  )}`;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "قيد المراجعة",
          color: "text-[#854d0e] bg-[#fefce8] border-[#fef08a]",
          dot: "bg-[#eab308]",
          icon: Clock,
          desc: "نحن نراجع طلبك الآن، سيتم التواصل معك قريباً.",
        };
      case "CONFIRMED":
        return {
          label: "تم التأكيد",
          color: "text-[#166534] bg-[#f0fdf4] border-[#bbf7d0]",
          dot: "bg-[#22c55e]",
          icon: CheckCircle2,
          desc: "تم تأكيد طلبك وجاري تجهيز المنتجات.",
        };
      case "DELIVERED":
        return {
          label: "تم التوصيل",
          color: "text-[#1e40af] bg-[#eff6ff] border-[#bfdbfe]",
          dot: "bg-[#3b82f6]",
          icon: Truck,
          desc: "وصلت الشحنة بنجاح، نتمنى أن تنال إعجابكم.",
        };
      case "CANCELLED":
        return {
          label: "تم الإلغاء",
          color: "text-[#991b1b] bg-[#fef2f2] border-[#fecaca]",
          dot: "bg-[#ef4444]",
          icon: XCircle,
          desc: "تم إلغاء هذا الطلب.",
        };
      default:
        return {
          label: status,
          color: "text-gray-700 bg-gray-50 border-gray-200",
          dot: "bg-gray-400",
          icon: Package,
          desc: "",
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const hasTonItems = order.items?.some(
    (item) => item.product?.unit === "طن" || item.product?.unit === "Ton",
  );

  const handleCancelOrder = async () => {
    setIsCancelLoading(true);
    const result = await cancelOrder(order.id);
    if (result.success) {
      toast.success(result.message);
      setOrder({ ...order, status: "CANCELLED" });
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsCancelLoading(false);
  };

  const handleUpdateAddress = async () => {
    if (!newAddress || newAddress.length < 5) {
      toast.error("يرجى إدخال عنوان صحيح");
      return;
    }
    setIsEditLoading(true);
    const result = await updateOrderAddress(order.id, newAddress);
    if (result.success) {
      toast.success(result.message);
      if (order.address) {
        setOrder({
          ...order,
          address: { ...order.address, addressText: newAddress },
        });
      }
      setIsEditDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsEditLoading(false);
  };

  // Loading State
  if (!isInitialized) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F9FAFB] p-6"
        dir="rtl"
      >
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#0a4d3c]/20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-lg">
            <Package className="h-10 w-10 animate-bounce text-[#0a4d3c]" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-900">
            جاري التحقق من الطلب
          </h2>
          <p className="text-slate-500 font-bold animate-pulse">
            لحظات ونكون معك...
          </p>
        </div>
      </div>
    );
  }

  // Protection Check
  if (!customer || customer.id !== initialOrder.customerId) {
    return null;
  }

  return (
    <div
      className="pb-40 bg-[#f8fafc] min-h-screen font-sans selection:bg-[#0a4d3c]/10"
      dir="rtl"
    >
      {/* Header Bar - Modern Glassmorphism */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all hover:-translate-x-1"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none mb-1">
                تفاصيل الطلب
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Order Details
              </p>
            </div>
          </div>
          <div
            className={cn(
              "px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-sm transition-all duration-500",
              statusInfo.color,
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                statusInfo.dot,
              )}
            />
            <span className="text-xs font-black">{statusInfo.label}</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-5 sm:p-8 space-y-6">
        {/* Top Section: Order ID & Status Banner */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0a4d3c]/5 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0a4d3c]">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">
                    #{order.orderNumber.split("-").pop()}
                  </h2>
                  <p className="text-sm font-bold text-slate-400 mt-1">
                    رقم تتبع الطلب الرسمي
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right rtl:text-right">
              <div className="flex items-center gap-2 text-slate-400 font-bold mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">
                  {format(new Date(order.createdAt), "PPPP", { locale: ar })}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                ساعة الطلب:{" "}
                {format(new Date(order.createdAt), "p", { locale: ar })}
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
              <statusInfo.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed pt-2">
              {statusInfo.desc}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Details Bento */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              بيانات العميل
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                  {order.customer?.name?.charAt(0) || "ع"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">اسم العميل</p>
                  <p className="text-sm font-black text-slate-900">
                    {order.customer?.name || "عميل البدر"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">رقم الهاتف</p>
                  <p className="text-sm font-black text-slate-900" dir="ltr">
                    {order.customer?.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Address Bento */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                عنوان التوصيل
              </h3>
              {order.status === "PENDING" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-xl text-[#0a4d3c] hover:bg-[#0a4d3c]/5"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#0a4d3c]/[0.02] border border-[#0a4d3c]/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0a4d3c]" />
                <p className="text-sm font-black text-slate-900">
                  {order.address?.addressName || "العنوان المختار"}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-500 leading-relaxed pr-4">
                {order.address?.addressText || "لا يوجد عنوان مسجل"}
              </p>
            </div>
          </section>
        </div>

        {/* Product List Bento */}
        <section className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#0a4d3c]" />
              قائمة المشتريات
            </h3>
            <span className="text-sm p-2 font-black text-slate-400 bg-slate-50 rounded-full tracking-tighter">
              {order.items?.length}  منتجات
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-6 flex gap-6 items-center group">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 group-hover:border-[#0a4d3c]/20 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#0a4d3c]/5">
                  {item.product?.images[0] ? (
                    <Image
                      width={120}
                      height={120}
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-200 m-auto h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h4 className="font-black text-slate-900 text-lg leading-tight truncate">
                      {item.product?.name}
                    </h4>
                    <span className="text-lg font-black text-slate-900 whitespace-nowrap">
                      {item.product?.unit === "طن" ||
                        item.product?.unit === "Ton"
                        ? "يتم الاتفاق"
                        : `${(item.priceAtPurchase * item.quantity).toLocaleString()} ج.م`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-3 py-1 rounded-full bg-[#0a4d3c]/5 text-[10px] font-black text-[#0a4d3c]">
                      {item.quantity} × {item.product?.unit}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span className="text-[11px] font-bold text-slate-400">
                      سعر الوحدة:{" "}
                      {item.product?.unit === "طن" ||
                        item.product?.unit === "Ton"
                        ? "يتم الاتفاق"
                        : `${item.priceAtPurchase.toLocaleString()} ج.م`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Bill Summary */}
          <div className="pt-8 mt-4 border-t border-slate-100 space-y-5">
            <div className="flex justify-between text-sm font-bold text-slate-500 px-2">
              <span>المجموع الفرعي</span>
              <span className="text-slate-900">
                {hasTonItems
                  ? "يحدد لاحقاً"
                  : `${order.totalPrice.toLocaleString()} ج.م`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500 px-2">
              <span>خدمة التوصيل</span>
              <span className="text-green-600 font-black">
                مجاني (لفترة محدودة)
              </span>
            </div>
            <div className="py-2 px-6 flex justify-between items-center bg-[#0a4d3c]/[0.03] rounded-[2rem] border border-[#0a4d3c]/5">
              <span className="text-lg font-black text-slate-900">
                الإجمالي النهائي :
              </span>
              <span className="text-lg md:text-2xl font-black text-[#0a4d3c]">
                {hasTonItems
                  ? "يتم الاتفاق"
                  : `${order.totalPrice.toLocaleString()} ج.م`}
              </span>
            </div>
            {hasTonItems && (
              <div className="p-5 bg-amber-50 rounded-[1.5rem] text-[11px] text-amber-800 font-bold leading-relaxed border border-amber-100 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>
                  المنتجات المسعرة بالطن تعتمد على سعر البورصة اليومي. سيقوم
                  المندوب بتأكيد التكلفة النهائية معك.
                </span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Action Floating Bar - Ultra Premium */}
      <div className="fixed bottom-12 left-0 right-0 p-4 bg-white/90 backdrop-blur-2xl border-t border-slate-200/50 z-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-1">
          <Link
            href={whatsappLink}
            target="_blank"
            className={cn(
              buttonVariants({
                variant: "default",
                className:
                  "flex-1 rounded-[1.5rem] h-16 gap-3 py-2 text-lg font-black bg-[#0a4d3c] hover:bg-[#0a4d3c]/90 shadow-xl shadow-[#0a4d3c]/10 transition-all hover:scale-[1.02] active:scale-[0.98]",
              }),
            )}
          >
            <MessageCircle className="w-6 h-6" />
            تواصل معنا واتساب
          </Link>

          {order.status === "PENDING" && (
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  variant="ghost"
                  className="sm:w-auto px-10 rounded-[1.5rem] h-16 text-red-500 hover:text-red-600 hover:bg-red-50 font-black gap-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  إلغاء الطلب
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] w-[95%] sm:max-w-[400px] border-none p-10 shadow-2xl">
                <AlertDialogHeader className="space-y-6">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
                    <XCircle className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <AlertDialogTitle className="text-2xl font-black text-slate-900">
                      تأكيد الإلغاء
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base font-bold text-slate-500">
                      هل أنت متأكد من إلغاء الطلب رقم #
                      {order.orderNumber.split("-").pop()}؟ لا يمكن التراجع عن
                      هذا الإجراء.
                    </AlertDialogDescription>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-3 mt-10">
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 text-white rounded-[1.25rem] h-14 text-lg font-black w-full shadow-lg shadow-red-200"
                    onClick={handleCancelOrder}
                    disabled={isCancelLoading}
                  >
                    {isCancelLoading ? "جاري الإلغاء..." : "نعم، قم بالإلغاء"}
                  </AlertDialogAction>
                  <AlertDialogCancel className="rounded-[1.25rem] h-14 text-lg font-black border-none hover:bg-slate-100 w-full text-slate-400">
                    تراجع
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Edit Address Dialog - Consistent Style */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] w-[95%] sm:max-w-[450px] border-none p-10 shadow-2xl">
          <DialogHeader className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto text-[#0a4d3c]">
              <MapPin className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900">
                تحديث العنوان
              </DialogTitle>
              <DialogDescription className="text-base font-bold text-slate-500">
                أدخل تفاصيل العنوان الجديد لضمان التوصيل السليم في أسرع وقت.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="py-8">
            <div className="space-y-3">
              <Label
                htmlFor="address"
                className="font-black text-slate-900 px-2 block text-sm"
              >
                العنوان التفصيلي
              </Label>
              <Input
                id="address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="مثال: شارع النيل، بجوار مكتب البريد"
                className="rounded-[1.5rem] h-16 border-slate-100 focus:ring-[#0a4d3c] focus:border-[#0a4d3c] bg-slate-50 px-6 text-base font-bold transition-all focus:shadow-inner"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full rounded-[1.5rem] h-16 text-lg font-black bg-[#0a4d3c] hover:bg-[#0a4d3c]/90 shadow-xl shadow-[#0a4d3c]/10"
              onClick={handleUpdateAddress}
              disabled={isEditLoading}
            >
              {isEditLoading ? "جاري الحفظ..." : "حفظ العنوان الجديد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
