import { notFound } from 'next/navigation';
import { getProductById } from '@/actions/productActions';
import ProductDetailsClient from './ProductDetailsClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}
export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductById((await params).id);
  if (!product) return { title: 'منتج غير موجود' };

  return {
    title: `${product.name} | البدر للتجارة`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById((await params).id);
  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
