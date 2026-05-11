"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (val: number) => void;
  unit?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  setQuantity,
  unit = "قطعة",
}) => {
  const increment = () => {
    setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === "") {
      // Allow empty input temporarily but set to 1 on blur or similar
      // For now we just don't update if empty or handle it here
    }
  };

  return (
    <div className="flex items-center justify-between py-6 border-b border-zinc-100">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-zinc-900">الكمية</span>
        <span className="text-xs text-zinc-500 font-medium">أدخل الكمية المطلوبة بالـ {unit}</span>
      </div>
      <div className="flex items-center bg-zinc-100/80 rounded-2xl p-1.5 border border-zinc-200/50">
        <button
          onClick={decrement}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-zinc-600 active:scale-95 hover:text-emerald-600 transition-all disabled:opacity-50 disabled:active:scale-100"
          disabled={quantity <= 1}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="min-w-[80px] px-2 text-center flex flex-col items-center justify-center">
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            className="w-full bg-transparent border-none text-center font-black text-xl text-emerald-950 focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">
            {unit}
          </span>
        </div>
        <button
          onClick={increment}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-zinc-600 active:scale-95 hover:text-emerald-600 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
