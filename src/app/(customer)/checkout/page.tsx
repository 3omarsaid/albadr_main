import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CheckoutForm } from "@/components/customer/checkout/CheckoutForm";

export const metadata = {
  title: "إتمام الطلب",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-zinc-100/80">
        <Link
          href="/cart"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-zinc-600 active:scale-90 transition-transform border border-zinc-100"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-black text-xl text-emerald-950 absolute left-1/2 -translate-x-1/2">
          إتمام الطلب
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
