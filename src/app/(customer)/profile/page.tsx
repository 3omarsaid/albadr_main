"use client";

import React, { useState } from "react";
import { useCustomerStore } from "@/stores/customerStore";
import { createOrUpdateCustomer } from "@/actions/customerActions";
import { User, Phone, MapPin, Edit2, Save, LogOut, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { customer, setCustomer, logout } = useCustomerStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(customer?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!customer) {
    return (
      <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">لم تقم بتسجيل الدخول بعد</h1>
        <p className="text-zinc-500 mb-8 max-w-xs">يرجى تسجيل بياناتك لتتمكن من إدارة حسابك وعناوينك</p>
        <button
          onClick={() => router.push("/")}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
        >
          العودة للرئيسية
        </button>
      </main>
    );
  }

  const handleUpdateProfile = async () => {
    if (!name) {
      toast.error("الاسم مطلوب");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createOrUpdateCustomer(name, customer.phoneNumber);
      if (result.success && result.customer) {
        setCustomer({
          ...customer,
          name: result.customer.name,
        });
        toast.success("تم تحديث البيانات بنجاح");
        setIsEditing(false);
      } else {
        toast.error("فشل تحديث البيانات");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-zinc-50 pb-32">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="flex items-center justify-between relative z-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-black text-zinc-900">حسابي</h1>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center relative z-10">
          <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-600/30 mb-4 ring-4 ring-white">
            <span className="text-white text-3xl font-black">{customer.name.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">{customer.name}</h2>
          <p className="text-zinc-500 font-medium ltr">{customer.phoneNumber}</p>
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-6 relative z-20">
        {/* Personal Info Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="font-bold text-zinc-800">البيانات الشخصية</h3>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-emerald-600 font-bold text-sm flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                تعديل
              </button>
            ) : (
              <button 
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="text-emerald-600 font-bold text-sm flex items-center gap-1"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                حفظ
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 mr-1">الاسم بالكامل</span>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              ) : (
                <p className="text-zinc-700 font-bold">{customer.name}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400 mr-1">رقم الهاتف</span>
              <p className="text-zinc-700 font-bold ltr text-right">{customer.phoneNumber}</p>
            </div>
          </div>
        </section>

        {/* Addresses Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="font-bold text-zinc-800">عناويني المسجلة</h3>
            </div>
          </div>

          <div className="space-y-3">
            {(customer.addresses || []).length > 0 ? (
              (customer.addresses || []).map((addr) => (
                <div 
                  key={addr.id}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-200 text-zinc-500'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-zinc-900 truncate">{addr.addressName}</h4>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">افتراضي</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{addr.addressText}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 space-y-2">
                <MapPin className="w-8 h-8 text-zinc-200 mx-auto" />
                <p className="text-sm text-zinc-400">لا توجد عناوين مسجلة بعد</p>
              </div>
            )}
          </div>
        </section>
      </div>

    </main>
  );
}
