"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerStore } from "@/stores/customerStore";
import { SerializedAddress } from "@/types";
import { redirect, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { submitOrder } from "@/actions/orderActions";
import {
  Loader2,
  AlertCircle,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  Plus,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";


// Dynamically import the map to prevent SSR issues 
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-zinc-100 animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
    </div>
  ),
});

const checkoutSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  phoneNumber: z
    .string()
    .min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل")
    .regex(/^[0-9]+$/, "أرقام فقط"),
  addressText: z
    .string()
    .min(5, "يرجى كتابة تفاصيل العنوان (مثال: اسم الشارع، رقم العمارة)"),
  latitude: z.number({ message: "يرجى تحديد موقعك على الخريطة" }),
  longitude: z.number({ message: "يرجى تحديد موقعك على الخريطة" }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const router = useRouter();  
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { customer, isInitialized, setCustomer } = useCustomerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [hasLoadedInitialAddress, setHasLoadedInitialAddress] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: customer?.name || "",
      phoneNumber: customer?.phoneNumber || "",
      addressText: "",
    },
  });

  const watchLat = watch("latitude");
  const watchLng = watch("longitude");

  const defaultLocation = React.useMemo(() => 
    watchLat && watchLng ? { lat: watchLat, lng: watchLng } : undefined,
    [watchLat, watchLng]
  );

  // Load saved customer info and set default address
  useEffect(() => {
    if (customer) {
      if (!isEditingInfo) {
        setValue("name", customer.name);
        setValue("phoneNumber", customer.phoneNumber);
      }

      // Auto-select first address only ONCE when store is initialized/rehydrated
      const addresses = customer.addresses || [];
      if (
        addresses.length > 0 &&
        !hasLoadedInitialAddress
      ) {
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        setValue("latitude", defaultAddr.latitude, { shouldValidate: true });
        setValue("longitude", defaultAddr.longitude, { shouldValidate: true });
        setValue("addressText", defaultAddr.addressText || "", {
          shouldValidate: true,
        });
        setHasLoadedInitialAddress(true);
      }
    }
  }, [
    customer,
    setValue,
    isEditingInfo,
    hasLoadedInitialAddress,
  ]);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      // Use a small epsilon for coordinate comparison to avoid floating point issues
      const currentLat = getValues("latitude");
      const currentLng = getValues("longitude");
      
      const latChanged = !currentLat || Math.abs(currentLat - lat) > 0.00001;
      const lngChanged = !currentLng || Math.abs(currentLng - lng) > 0.00001;
      const addressChanged = address && getValues("addressText") !== address;

      if (latChanged) setValue("latitude", lat, { shouldValidate: true });
      if (lngChanged) setValue("longitude", lng, { shouldValidate: true });

      // Only update address text if it's empty or changed by the map
      if (addressChanged && !getValues("addressText")) {
        setValue("addressText", address, { shouldValidate: true });
      }
    },
    [setValue, getValues],
  );

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("سلة التسوق فارغة");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      ...data,
      customerId: customer?.id,
      addressName: "عنوان التوصيل",
      totalPrice: getTotalPrice(),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        isNegotiable: item.unit.includes("طن") || item.price === 0,
      })),
    };

    try {
      const result = await submitOrder(orderData);

      if (result.success && result.whatsappUrl) {
        if (result.customer) {
          setCustomer(result.customer);
        }
        toast.success("تم تجهيز طلبك! جاري تحويلك للواتساب...");
        clearCart();
        window.open(result.whatsappUrl, "_blank");

        setTimeout(() => {
          router.push("/orders");
        }, 500);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = getTotalPrice();
  const negotiable = items.some(
    (item) => item.unit.includes("طن") || item.price === 0,
  );

  if (!isInitialized) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <div className="h-64 bg-zinc-100 animate-pulse rounded-3xl" />
        <div className="h-32 bg-zinc-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 pb-32 px-4 max-w-2xl mx-auto"
    >
      {/* 1. Location Section */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg">موقع التوصيل</h2>
          </div>
        </div>

        <div className="space-y-4">
          <InteractiveMap
            onLocationSelect={handleLocationSelect}
            defaultLocation={defaultLocation}
          />
          {errors.latitude && (
            <p className="text-red-500 text-sm">{errors.latitude.message}</p>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 ml-1">
              تفاصيل العنوان
            </label>
            <textarea
              {...register("addressText")}
              placeholder="مثال: الشارع الرئيسي، بجوار صيدلية كذا، علامة مميزة..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none h-24"
            />
            {errors.addressText && (
              <p className="text-red-500 text-sm">
                {errors.addressText.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. Personal Info Section */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg">البيانات الشخصية</h2>
          </div>

          {customer && !isEditingInfo && (
            <button
              type="button"
              onClick={() => setIsEditingInfo(true)}
              className="text-zinc-400 hover:text-emerald-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 ml-1">
                الاسم بالكامل
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register("name")}
                  readOnly={(customer && !isEditingInfo) || false}
                  placeholder="الاسم"
                  className={`w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pr-11 pl-4 text-sm outline-none transition-all ${
                    (customer && !isEditingInfo) || false
                      ? "opacity-70 cursor-not-allowed"
                      : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 ml-1">
                رقم الواتساب
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  dir="ltr"
                  {...register("phoneNumber")}
                  readOnly={(customer && !isEditingInfo) || false}
                  placeholder="01xxxxxxxxx"
                  className={`w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pr-11 pl-4 text-sm outline-none transition-all text-right ${
                    (customer && !isEditingInfo) || false
                      ? "opacity-70 cursor-not-allowed"
                      : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
      </section>

      {/* 3. Order Summary & Submit (Sticky Bottom - Above Nav) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1200] bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-500">الإجمالي:</span>
            </div>
            {negotiable ? (
              <span className="text-xs font-black text-amber-600">
                يحدد عبر الواتساب
              </span>
            ) : (
              <div className="flex items-baseline gap-1 text-emerald-950">
                <span className="font-black text-lg">{totalPrice}</span>
                <span className="text-[10px] font-bold text-zinc-400">ج.م</span>
              </div>
            )}
          </div>

          {negotiable && (
            <div className="bg-amber-50/50 rounded-lg p-1.5 flex gap-1.5 items-center border border-amber-100/50">
              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              <p className="text-[9px] text-amber-800 leading-tight font-bold">
                السعر النهائي سيتم تأكيده عبر الواتساب.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-emerald-600 text-white rounded-xl py-2.5 font-black text-sm shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                تأكيد الطلب
              </>
            )}
          </button>
        </div>
      </nav>
    </form>
  );
}
