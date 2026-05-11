"use client";

import React, { useState, useEffect } from "react";
import { useCustomerStore } from "@/stores/customerStore";
import { createOrUpdateCustomer, getCustomerByPhone } from "@/actions/customerActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Assuming shadcn dialog is available or I will create a simple modal
import { User, Phone, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Simple Modal if Dialog is not available
function Modal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {children}
      </div>
    </div>
  );
}

export function WelcomeModal() {
  const { customer, setCustomer, isInitialized } = useCustomerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Sync data on load if phone number exists
  useEffect(() => {
    if (isInitialized && customer?.phoneNumber) {
      const syncCustomer = async () => {
        try {
          const freshCustomer = await getCustomerByPhone(customer.phoneNumber);
          if (freshCustomer) {
            setCustomer(freshCustomer);
          }
        } catch (error) {
          console.error("Sync failed:", error);
        }
      };
      syncCustomer();
    }
  }, [isInitialized, customer?.phoneNumber, setCustomer]);

  useEffect(() => {
    // Show modal if initialized and no customer is found
    if (isInitialized && !customer) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    } else if (customer && isOpen) {
      setTimeout(() => setIsOpen(false), 0);
    }
  }, [isInitialized, customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("يرجى إدخال جميع البيانات");
      return;
    }

    if (phone.length < 10) {
      toast.error("رقم الهاتف غير صالح");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createOrUpdateCustomer(name, phone);
      if (result.success && result.customer) {
        setCustomer(result.customer);
        toast.success(`أهلاً بك يا ${name}!`);
        setIsOpen(false);
      } else {
        toast.error(result.error || "حدث خطأ ما");
      }
    } catch (error) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="p-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <User className="w-8 h-8 text-emerald-600" />
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">مرحباً بك في البدر</h2>
          <p className="text-zinc-500 text-sm">سجل بياناتك لسهولة الطلب ومتابعة طلباتك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 mr-1">الاسم بالكامل</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pr-12 pl-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 mr-1">رقم الهاتف (واتساب)</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pr-12 pl-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-right"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>بدء التسوق</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
