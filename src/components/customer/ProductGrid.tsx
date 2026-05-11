'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { SerializedProduct } from '@/types';

export const ProductGrid = ({ products }: { products: SerializedProduct[] }) => {
  return (
    <div className="px-4 pb-24">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
