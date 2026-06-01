'use server';

import { prisma } from '@/lib/prisma';
import { SerializedProduct } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getProducts(category?: string, includeInactive: boolean = false): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(category && category !== 'الكل' ? { category } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return products.map(p => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch product by id:', error);
    return null;
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath(`/product/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function createProduct(data: Partial<SerializedProduct>) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name!,
        description: data.description || '',
        category: data.category!,
        unit: data.unit || 'جركن',
        price: data.price || 0,
        isActive: data.isActive ?? true,
        images: data.images || [],
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true, product: {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }};
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(id: string, data: Partial<SerializedProduct>) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit,
        price: data.price,
        isActive: data.isActive,
        images: data.images,
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath(`/product/${id}`);
    return { success: true, product: {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }};
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function updateProductStatus(id: string, isActive: boolean) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath(`/product/${id}`);
    return { success: true, product: {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }};
  } catch (error) {
    console.error('Failed to update product status:', error);
    return { success: false, error: 'Failed to update product status' };
  }
}

export async function getUniqueCategories() {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map(c => c.category).filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getUniqueUnits() {
  try {
    const units = await prisma.product.findMany({
      select: { unit: true },
      distinct: ['unit'],
    });
    return units.map(u => u.unit).filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return [];
  }
}

