'use client';

import React, { useState } from 'react';
import { ImageCarousel } from '@/components/customer/product/ImageCarousel';
import { QuantitySelector } from '@/components/customer/product/QuantitySelector';
import { ProductAccordion } from '@/components/customer/product/ProductAccordion';
import { StickyAddToCartBar } from '@/components/customer/product/StickyAddToCartBar';
import { Badge } from '@/components/ui/badge';
import { Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SerializedProduct } from '@/types';



interface ProductDetailsClientProps {
  product: SerializedProduct;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1);

  const isNegotiable = Number(product.price) === 0 || product.unit.includes('طن');

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-32">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-zinc-100/80 lg:px-8">
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-zinc-600 active:scale-90 transition-transform border border-zinc-100"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-zinc-600 active:scale-90 transition-transform border border-zinc-100">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-start">
          
          {/* Left Column: Image (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-24">
            <ImageCarousel images={product.images} />
          </div>

          {/* Right Column: Product Info */}
          <div className="px-5 py-8 lg:py-0 space-y-8 bg-white lg:bg-transparent -mt-10 lg:mt-0 rounded-t-[40px] lg:rounded-none relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.04)] lg:shadow-none border-t border-zinc-100 lg:border-none">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 font-black px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider">
                  {product.category}
                </Badge>
                {product.isActive ? (
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 font-black px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider">
                    متوفر بالمخزن
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="font-black px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider">
                    نفذت الكمية
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-emerald-950 leading-[1.1] tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="lg:bg-white lg:rounded-[32px] lg:p-10 lg:shadow-xl lg:shadow-zinc-200/40 lg:border lg:border-zinc-100/80 space-y-2">
              
              {/* Price Display */}
              <div className="space-y-2 py-6 border-b border-zinc-100">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                  السعر لكل {product.unit}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "font-black tracking-tight text-emerald-950",
                    isNegotiable ? "text-2xl" : "text-4xl"
                  )}>
                    {isNegotiable ? "يحدد لاحقاً" : Number(product.price).toLocaleString()}
                  </span>
                  {!isNegotiable && (
                    <span className="text-sm font-bold text-zinc-500">ج.م</span>
                  )}
                  {isNegotiable && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      تفاوض
                    </span>
                  )}
                </div>
              </div>

              <QuantitySelector 
                quantity={quantity}
                setQuantity={setQuantity}
                unit={product.unit}
              />

              <ProductAccordion 
                description={product.description}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bar */}
      <StickyAddToCartBar 
        product={{
          id: product.id,
          name: product.name,
          image: product.images[0],
          price: Number(product.price),
          unit: product.unit
        }}
        quantity={quantity}
      />
    </div>
  );
}
