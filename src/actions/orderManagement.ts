'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
  SerializedOrder, 
  SerializedOrderItem, 
  OrderStatus 
} from '@/types';

import { 
  Order as PrismaOrder, 
  OrderItem as PrismaOrderItem, 
  Product as PrismaProduct, 
  Customer as PrismaCustomer, 
  CustomerAddress as PrismaAddress 
} from '@prisma/client';

type OrderWithRelations = PrismaOrder & {
  items?: (PrismaOrderItem & {
    product?: PrismaProduct | null;
  })[];
  customer?: PrismaCustomer | null;
  address?: PrismaAddress | null;
};

/**
 * Helper to deeply serialize Prisma objects (converting Decimal to Number and Date to ISO string)
 */
function serializeOrder(order: OrderWithRelations): SerializedOrder {
  return {
    ...order,
    totalPrice: Number(order.totalPrice),
    status: order.status as OrderStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items?.map((item): SerializedOrderItem => ({
      ...item,
      priceAtPurchase: Number(item.priceAtPurchase),
      createdAt: item.createdAt.toISOString(),
      product: item.product ? {
        ...item.product,
        price: Number(item.product.price),
        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.updatedAt.toISOString(),
      } : undefined,
    })) || [],
    customer: order.customer ? {
      ...order.customer,
      createdAt: order.customer.createdAt.toISOString(),
      updatedAt: order.customer.updatedAt.toISOString(),
    } : null,
    address: order.address ? {
      ...order.address,
      createdAt: order.address.createdAt.toISOString(),
      updatedAt: order.address.updatedAt.toISOString(),
    } : null,
  };
}

export async function getCustomerOrders(customerId: string): Promise<SerializedOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map(order => serializeOrder(order as OrderWithRelations));
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<SerializedOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        customer: true,
      },
    });

    if (!order) return null;
    return serializeOrder(order as OrderWithRelations);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return null;
  }
}


/**
 * Cancels an order if it is currently PENDING.
 */
export async function cancelOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, message: 'الطلب غير موجود' };
    }

    if (order.status !== 'PENDING') {
      return { success: false, message: 'لا يمكن إلغاء الطلب إلا إذا كان قيد الانتظار' };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, message: 'تم إلغاء الطلب بنجاح' };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, message: 'حدث خطأ أثناء إلغاء الطلب' };
  }
}

/**
 * Updates the delivery address of an order if it is currently PENDING.
 */
export async function updateOrderAddress(orderId: string, newAddress: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, message: 'الطلب غير موجود' };
    }

    if (order.status !== 'PENDING') {
      return { success: false, message: 'لا يمكن تعديل العنوان إلا إذا كان الطلب قيد الانتظار' };
    }

    // We update the address text on the associated address record. 
    // Note: This might affect other orders if they share the same address record, 
    // but in our flow, each order typically has a snapshot or we can update the addressText of that specific addressId.
    // However, the prompt asks to update the delivery details (address string).
    await prisma.customerAddress.update({
      where: { id: order.addressId },
      data: { addressText: newAddress },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, message: 'تم تحديث العنوان بنجاح' };
  } catch (error) {
    console.error('Error updating order address:', error);
    return { success: false, message: 'حدث خطأ أثناء تحديث العنوان' };
  }
}
