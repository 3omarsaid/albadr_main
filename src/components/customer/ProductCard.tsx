"use client";

import React from "react";
import Image from "next/image";
import { List } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SerializedProduct } from "@/types";

interface ProductCardProps {
  product: SerializedProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const isNegotiable = Number(product.price) === 0;

  return (
    <Link href={`/product/${product.id}`} className="cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow group"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            {product.category}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-emerald-950 mb-1 truncate">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-xl font-black text-emerald-900">
                {isNegotiable ? "يحدد لاحقاً" : Number(product.price).toLocaleString()}
                {!isNegotiable && <span className="text-xs font-bold mr-1">ج.م</span>}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">لكل {product.unit}</span>
            </div>
            <Button
              size="icon"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
